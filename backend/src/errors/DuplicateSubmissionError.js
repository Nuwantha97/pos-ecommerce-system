export default class DuplicateSubmissionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DuplicateSubmissionError';
    this.status = 409;
  }
}