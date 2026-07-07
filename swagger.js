import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '판다마켓 API',
      version: '1.0.0',
      description: '판다마켓 중고거래 플랫폼 API 문서',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        MessageResponse: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        UserSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nickname: { type: 'string' },
            image: { type: 'string', nullable: true },
          },
        },
        AuthUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            nickname: { type: 'string' },
            image: { type: 'string', nullable: true },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            nickname: { type: 'string' },
            image: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LikeResult: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            likeCount: { type: 'integer' },
            isLiked: { type: 'boolean' },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            image: { type: 'string', nullable: true },
            likeCount: { type: 'integer' },
            ownerId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ArticleListItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            image: { type: 'string', nullable: true },
            likeCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            owner: { $ref: '#/components/schemas/UserSummary' },
          },
        },
        ArticleDetail: {
          allOf: [
            { $ref: '#/components/schemas/Article' },
            {
              type: 'object',
              properties: {
                owner: { $ref: '#/components/schemas/UserSummary' },
                comments: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ArticleCommentWithAuthor' },
                },
                isLiked: { type: 'boolean' },
              },
            },
          ],
        },
        ArticleComment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ArticleCommentWithAuthor: {
          allOf: [
            { $ref: '#/components/schemas/ArticleComment' },
            {
              type: 'object',
              properties: { author: { $ref: '#/components/schemas/UserSummary' } },
            },
          ],
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'integer' },
            tags: { type: 'array', items: { type: 'string' } },
            images: { type: 'array', items: { type: 'string' } },
            likeCount: { type: 'integer' },
            ownerId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductListItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            price: { type: 'integer' },
            images: { type: 'array', items: { type: 'string' } },
            likeCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductDetail: {
          allOf: [
            { $ref: '#/components/schemas/Product' },
            {
              type: 'object',
              properties: {
                comments: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ProductCommentWithAuthor' },
                },
                isLiked: { type: 'boolean' },
              },
            },
          ],
        },
        ProductComment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductCommentWithAuthor: {
          allOf: [
            { $ref: '#/components/schemas/ProductComment' },
            {
              type: 'object',
              properties: { author: { $ref: '#/components/schemas/UserSummary' } },
            },
          ],
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

export default swaggerJsdoc(options);
