// import { Injectable } from '@nestjs/common';
// import { ElasticsearchService } from '@nestjs/elasticsearch';
// import { ConfigService } from '@nestjs/config';
// import { Post } from '@/domain/posts/entities/post.entity';
//
// @Injectable()
// export class SearchService {
//   constructor(
//     private readonly esService: ElasticsearchService,
//     private readonly configService: ConfigService,
//   ) {}
//
//   async createIndex() {
//     const index = this.configService.get('ES_INDEX');
//     const env = this.configService.get('NODE_ENV');
//     const checkIndex = await this.esService.indices.exists({
//       index,
//     });
//
//     if (!checkIndex) {
//       await this.esService.indices.create({
//         index,
//         settings: {
//           analysis: {
//             filter: {
//               autocomplete_filter: {
//                 type: 'edge_ngram',
//                 min_gram: 1,
//                 max_gram: 20,
//               },
//             },
//             analyzer: {
//               autocomplete: {
//                 type: 'custom',
//                 tokenizer: 'standard',
//                 filter: ['lowercase', 'autocomplete_filter'],
//               },
//             },
//           },
//         },
//         mappings: {
//           properties: {
//             content: {
//               type: 'text',
//               analyzer: 'autocomplete',
//               search_analyzer: 'standard',
//               fields: {
//                 keyword: {
//                   type: 'keyword',
//                   ignore_above: 256,
//                 },
//               },
//             },
//             title: {
//               type: 'text',
//               analyzer: 'autocomplete',
//               search_analyzer: 'standard',
//               fields: {
//                 keyword: {
//                   type: 'keyword',
//                   ignore_above: 256,
//                 },
//               },
//             },
//             category: {
//               type: 'text',
//               fields: {
//                 keyword: {
//                   type: 'keyword',
//                   ignore_above: 256,
//                 },
//               },
//             },
//             animalOfAuthor: {
//               type: 'text',
//               fields: {
//                 keyword: {
//                   type: 'keyword',
//                   ignore_above: 256,
//                 },
//               },
//             },
//             tags: {
//               type: 'text',
//               fields: {
//                 keyword: {
//                   type: 'keyword',
//                   ignore_above: 256,
//                 },
//               },
//             },
//             updatedAt: {
//               type: 'date',
//             },
//           },
//         },
//       });
//     }
//
//     // 개발 환경에서 초기에 데이터 날리는 부분
//     if (env !== 'production') {
//       await this.esService.deleteByQuery({
//         index,
//         query: {
//           match_all: {},
//         },
//       });
//     }
//   }
//
//   async indexPost(post: Post) {
//     return await this.esService.index({
//       index: this.configService.get('ES_INDEX'),
//       id: post.id.toString(),
//       document: post,
//     });
//   }
//
//   async update(postId: number, updatedPost: Post) {
//     return await this.esService.update({
//       index: this.configService.get('ES_INDEX'),
//       id: postId.toString(),
//       doc: updatedPost,
//     });
//   }
//
//   async remove(postId: number) {
//     await this.esService.delete({
//       index: this.configService.get('ES_INDEX'),
//       id: postId.toString(),
//     });
//   }
//
//   async removeMany(postIds: number[]) {
//     await this.esService.deleteByQuery({
//       index: this.configService.get('ES_INDEX'),
//       query: {
//         terms: {
//           id: postIds,
//         },
//       },
//     });
//   }
//
//   async search(query: any) {
//     const body = await this.esService.search({
//       index: this.configService.get('ES_INDEX'),
//       ...query,
//     });
//
//     const hits = body.hits.hits;
//     const total = body.hits.total;
//     const data = hits.map((item) => item._source);
//
//     return { total, data };
//   }
// }
