pipeline {
    agent any

    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch to build and deploy')
        choice(name: 'TARGET_ENVIRONMENT', choices: ["UAT"], description: 'Target Environment')
    }

    environment {
        BUILD_TAG = 'latest'
        UI_BUILD_NUMBER = 'latest'
        BACKEND_BUILD_NUMBER = 'latest'
    }

    stages {
        stage('Build Docker Images') {
            steps {
                script {
                    def secretSantaBuild = build job: 'secret-santa-build',
                          propagate: false,
                          wait: true, 
                          parameters: [
                              string(name: 'BRANCH_NAME', value: params.BRANCH_NAME)
                          ]
                    
                    BUILD_TAG = secretSantaBuild.displayName
                    echo "BUILD_TAG is: ${BUILD_TAG}"

                    if (BUILD_TAG == 'latest') {
                        error "Failed to capture BUILD_TAG from the secret-santa-build."
                    }
                    
                    if (secretSantaBuild.result != 'SUCCESS') {
                        error "Secret-santa-build failed with status: ${secretSantaBuild.result}"
                    }
                }
            }
        }

        stage('Deploy Docker Images') {
            steps {
                script {
                    // Use the captured BUILD_TAG for deployment
                    def UI_BUILD_NUMBER = BUILD_TAG
                    def BACKEND_BUILD_NUMBER = BUILD_TAG
                    def TARGET_ENVIRONMENT = params.TARGET_ENVIRONMENT

                    def secretSantaDeployment = build job: 'secret-santa-deployment',
                          propagate: false,
                          wait: true, 
                          parameters: [
                              string(name: 'BRANCH_NAME', value: params.BRANCH_NAME),
                              string(name: 'UI_BUILD_NUMBER', value: UI_BUILD_NUMBER),
                              string(name: 'BACKEND_BUILD_NUMBER', value: BACKEND_BUILD_NUMBER),
                              string(name: 'TARGET_ENVIRONMENT', value: TARGET_ENVIRONMENT)
                          ]
                                        
                    if (secretSantaDeployment.result != 'SUCCESS') {
                        error "Model-sync-deployment failed with status: ${secretSantaDeployment.result}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Pipelines executed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
