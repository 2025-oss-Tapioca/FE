const erd = {
  diagrams: [
    {
      name: 'Post',
      attributes: [
        { name: 'post_id', type: 'INTEGER', primaryKey: true },
        { name: 'user_id', type: 'INTEGER', primaryKey: false }
      ]
    },
    {
      name: 'Get',
      attributes: [
        { name: 'user_id', type: 'INTEGER', primaryKey: false },
        { name: 'get_id', type: 'INTEGER', primaryKey: true }
      ]
    },
    {
      name: 'User',
      attributes: [
        { name: 'user_name', type: 'VARCHAR', primaryKey: false },
        { name: 'user_id', type: 'INTEGER', primaryKey: true }
      ]
    }
  ],
  relationships: [
    { from: 'User.user_id', to: 'Get.user_id', type: 'ONE_TO_MANY' },
    { from: 'User.user_id', to: 'Post.user_id', type: 'ONE_TO_MANY' }
  ]
};

export default erd;