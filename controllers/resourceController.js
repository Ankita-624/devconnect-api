const Resource = require('../models/Resource');

exports.createResource = async (req, res) => {
  try {
    console.log('Incoming user:', req.user); // Debug

    const newResource = new Resource({
      ...req.body,
      postedBy: req.user.id,
    });

    await newResource.save();
    res.status(201).json(newResource);
  } catch (err) {
    console.error(' Error in createResource:', err.message);
    res.status(500).json({ message: 'Failed to create resource' });
  }
};


exports.getAllResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;

    const query = {
      $and: [
        category ? { category } : {},
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ]
        }
      ]
    };

    const resources = await Resource.find(query)
      .populate('postedBy', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);

    res.status(200).json({
      resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};


exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    if (resource.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    Object.assign(resource, req.body);
    await resource.save();
    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    if (resource.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    await resource.remove();
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};
