pipeline {
    agent any
    
    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch to deploy')
        string(name: 'BACKEND_BUILD_NUMBER', defaultValue: '241210-1817', description: 'Build number for Backend')
        string(name: 'UI_BUILD_NUMBER', defaultValue: '241210-1817', description: 'Build number for UI')
    }

    environment {
        SSH_USER = 'root'
        SSH_HOST = '192.168.20.41'
        SSH_KEY = 'SSH_PASS_CREDENTIALS_BB-1-LXC-2'
        GIT_CREDENTIALS_ID = 'Secret-Santa-Jenkins'
    }

    stages {
        stage('Print Build Numbers and set Environment') {
            steps {
                echo "Backend Build Number: ${params.BACKEND_BUILD_NUMBER}"
                echo "UI Build Number: ${params.UI_BUILD_NUMBER}"
            }
            
        }

        stage('Docker Login') {
            steps {
                script {
                    echo "Logging into Docker registry using Jenkins credentials..."
                    docker.withRegistry('https://ghcr.io', GIT_CREDENTIALS_ID) {
                        echo "Successfully logged in to Docker registry"
                    }
                }
            }
        }
        
        stage('SSH to Server and Run Commands') {
            steps {
                
                sshagent(credentials: [SSH_KEY]) {
                sh """
                [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                ssh-keyscan -t rsa,dsa ${SSH_HOST} >> ~/.ssh/known_hosts

                    ssh -t ${SSH_USER}@${SSH_HOST} << ENDSSH
                        cd secret-santa
                        UI_BUILD_NUMBER=${params.UI_BUILD_NUMBER} BACKEND_BUILD_NUMBER=${params.BACKEND_BUILD_NUMBER} docker compose up -d
                        docker compose logs
                        exit
                    ENDSSH
                """
                }
                
                
            }
            
        }
    }
}