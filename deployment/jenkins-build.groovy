pipeline {
    agent any

    environment {
        GIT_CREDENTIALS_ID = 'Secret-Santa-Jenkins'
        BUILD_TAG = 'latest'
        UI_IMAGE = 'secret-santa-ui'
        BACKEND_IMAGE = 'secret-santa-backend'
    }

    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch to build')
    }

    stages {
        stage('Build Name') {
            steps {
                script {
                    // Generate a timestamp for the tag
                    BUILD_TAG = new Date().format("yyMMdd-HHmm")
                    currentBuild.displayName = BUILD_TAG
                }
            }
        }

        stage('Checkout') {
            steps {
                script {
                    echo "Checking out branch: ${params.BRANCH_NAME}"
                    git branch: "${params.BRANCH_NAME}", credentialsId: "${GIT_CREDENTIALS_ID}", url: 'https://github.com/ideaforgee/secretsanta.git'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build Docker images
                    dir("${WORKSPACE}") {
                        echo "----------------- Comencing build process -----------------"
                        sh 'docker compose build'
                    }
                }
            }
        }

         stage('Tag Docker Images') {
            steps {
                script {
                    // Tag Docker images 
                    dir("${WORKSPACE}") {

                        sh "docker image tag secret-santa-ui:${BUILD_TAG} ghcr.io/ideaforgee/secretsanta/secret-santa-ui:${BUILD_TAG}"
                        sh "docker image tag secret-santa-backend:${BUILD_TAG} ghcr.io/ideaforgee/secretsanta/secret-santa-backend:${BUILD_TAG}"

                        echo "----------------- Tagged Docker images Build:${BUILD_TAG}  -----------------"
                    }

                }
            }
        }

        stage('Push Docker Images to registry') {
            steps {
                script {
                    // Push Docker images 
                    dir("${WORKSPACE}") {
                        
                        echo "----------------- Login to registry -----------------"
                        
                        docker.withRegistry('https://ghcr.io', GIT_CREDENTIALS_ID) {
                            
                            def uiImage = docker.image("ghcr.io/ideaforgee/secretsanta/secret-santa-ui:${BUILD_TAG}")
                            echo "----------------- Pushing UI image to registry -----------------"
                            uiImage.push()
                        
                        }

                        docker.withRegistry('https://ghcr.io', GIT_CREDENTIALS_ID) {

                            def backendImage = docker.image("ghcr.io/ideaforgee/secretsanta/secret-santa-backend:${BUILD_TAG}")
                            echo "----------------- Pushing Backend image to registry -----------------"
                            backendImage.push()
                        
                        }
                    }

                    echo "----------------- Finished -----------------"
                    echo "----------------- Build Number : ${BUILD_TAG} -----------------"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completed"
        }
    }
}