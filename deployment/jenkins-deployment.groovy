pipeline {
    agent any
    
    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch to deploy')
        string(name: 'BACKEND_BUILD_NUMBER', description: 'Build number for Backend')
        string(name: 'UI_BUILD_NUMBER', description: 'Build number for UI')
        choice(name: 'TARGET_ENVIRONMENT', choices: ["UAT"], description: 'Target Environment')
    }

    environment {
        SSH_USER = 'root'
        SSH_HOST = ''
        SSH_KEY = ''
    }

    stages {
        stage('Print Build Numbers and set Environment') {
            steps {
                script {
                    if(params.TARGET_ENVIRONMENT == "UAT") {
                        SSH_HOST = "192.168.20.41"
                        SSH_KEY = "SSH_PASS_CREDENTIALS_BB-1-LXC-2"
                    } else if (params.TARGET_ENVIRONMENT == "PRODUCTION") {
                        SSH_HOST = "192.168.20.42"
                        SSH_KEY = "SSH_PASS_CREDENTIALS_BB-1-LXC-3"
                    }
                }
                echo "Backend Build Number: ${params.BACKEND_BUILD_NUMBER}"
                echo "UI Build Number: ${params.UI_BUILD_NUMBER}"
            }
            
        }
        
        stage('SSH to Server and Run Commands') {
            steps {
                
                sshagent(credentials: [SSH_KEY]) {
                  sh """
                      [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                      ssh-keyscan -t rsa,dsa ${SSH_HOST} >> ~/.ssh/known_hosts
                      
                      ssh -t -t  ${SSH_USER}@${SSH_HOST} 'bash -s << 'ENDSSH'
                              cd secret-santa
                              UI_BUILD_NUMBER=${params.UI_BUILD_NUMBER} BACKEND_BUILD_NUMBER=${params.BACKEND_BUILD_NUMBER} docker compose up -d
                              docker compose logs
                              exit
                        ENDSSH'
                      """
                }
            }
            
        }
    }
}