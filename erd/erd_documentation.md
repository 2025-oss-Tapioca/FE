# ERD Documentation

## Diagrams

### Get
- user_id: INTEGER
- get_id: INTEGER (Primary Key)

### User
- user_id: INTEGER (Primary Key)
- user_name: VARCHAR

### Post
- user_id: INTEGER
- post_id: INTEGER (Primary Key)

## Relationships

- User.user_id -> Get.user_id (1:N)
- User.user_id -> Post.user_id (1:N)