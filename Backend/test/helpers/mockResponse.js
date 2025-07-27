export function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.getHeaders = jest.fn(() => ({}));
  return res;
}

export function mockRequest(session = {}, body = {}) {
  return { session, body };
}
