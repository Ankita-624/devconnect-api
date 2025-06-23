const {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');

const Resource = require('../models/Resource');

jest.mock('../models/Resource');

describe('Resource Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 'user123' },
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  /*describe('createResource', () => {
    it('should create and return a new resource', async () => {
      req.body = {
        title: 'DevDocs',
        link: 'https://devdocs.io',
        category: 'Tool',
        description: 'Docs site',
      };

      const mockSaved = {
        ...req.body,
        postedBy: req.user.id,
        save: jest.fn().mockResolvedValue(true),
      };

      Resource.mockImplementation(() => mockSaved);

      await createResource(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ...req.body,
        postedBy: req.user.id,
      });
    });
  });
*/
describe('createResource', () => {
  it('should create and return a new resource', async () => {
    req.body = {
      title: 'DevDocs',
      link: 'https://devdocs.io',
      category: 'Tool',
      description: 'Docs site',
    };

    const mockSaved = {
      ...req.body,
      postedBy: req.user.id,
      save: jest.fn().mockResolvedValue(true),
    };

    Resource.mockImplementation(() => mockSaved);

    await createResource(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'DevDocs',
        link: 'https://devdocs.io',
        category: 'Tool',
        description: 'Docs site',
        postedBy: 'user123',
      })
    );
  });
});

  describe('getAllResources', () => {
    it('should return a list of resources with pagination', async () => {
      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: 'Mock Resource' }]),
      };

      Resource.find.mockReturnValue(mockFind);
      Resource.countDocuments.mockResolvedValue(1);

      req.query = { page: 1, limit: 10 };

      await getAllResources(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        resources: [{ title: 'Mock Resource' }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      });
    });
  });

  describe('updateResource', () => {
    it('should update the resource if owned by user', async () => {
      req.params.id = 'res123';
      req.body = { title: 'Updated Title' };

      const resource = {
        _id: 'res123',
        postedBy: 'user123',
        save: jest.fn().mockResolvedValue(true),
      };

      Resource.findById.mockResolvedValue(resource);

      await updateResource(req, res);

      expect(resource.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resource);
    });
  });

  describe('deleteResource', () => {
  it('should delete resource if owned by user', async () => {
   
  });
});
});