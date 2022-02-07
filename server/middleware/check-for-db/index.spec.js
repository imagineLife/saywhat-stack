const { checkForDbConnection } = require('./')

describe('checkForDbConnection', () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockImplementation(() => res);
    res.json = jest.fn().mockImplementation(() => res);
    res.send = jest.fn().mockImplementation(() => res)
    return res;
  };
  describe('returns err obj', () => {
    it('when is NOT db path OR healthCheck AND DB is not connected', () => {
      const mockReq = {
        path: '/water'
      }
      const mockRes = mockResponse();

      const res = checkForDbConnection(mockReq, mockRes)
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({Error: "Server Error, try again shortly"});

    })
  })
  describe('calls next fn when IS the "/db" path', () => {
     const mockReq = {
        path: '/db'
      }
      const mockRes = mockResponse();
      const mockNxt = jest.fn()
      const res = checkForDbConnection(mockReq, mockRes, mockNxt)
      expect(mockNxt).toHaveBeenCalledTimes(1)
  })
})