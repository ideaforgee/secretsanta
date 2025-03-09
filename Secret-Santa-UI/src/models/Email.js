class Email {
  constructor(
    subject = '',
    body = '',
    recipients = []
  ) {
    this.subject = subject;
    this.body = body;
    this.recipients = recipients;
  }
}

export default Email;