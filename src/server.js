
const { ApolloServer, gql } = require('apollo-server');

const fs = require("fs")
const path = require("path")

const {PrismaClient} = require("@prisma/client");
const { getUserId } = require('./utils');

// リゾルバ関係のファイル
const Query = require("./resolvers/Query")
const Mutation = require("./resolvers/Mutation")
const Link = require("./resolvers/Link")
const User = require("./resolvers/User")
const Vote = require("./resolvers/Vote")
const Subscription = require("./resolvers/Subscription")

// サブスクリプションの実装
// Publisher（送信者）/ Subscriber（受信者）
const { PubSub } = require('graphql-subscriptions');


const prisma = new PrismaClient();
const pubsub = new PubSub()


// HackerNewsの1つ1つの投稿
// let links = [
//     {
//         id: "link-0",
//         description: "GraphQLのチュートリアルを学ぶ",
//         url: "www.graphQl.com"
//     }
// ]

// resolver function(Queryに対して、何か値を入れている？)
const resolvers = {
    Query,
    Mutation,
    Subscription,
    Link,
    User
    // Query: {
    //     info: () => "HackerNewsクローン",
    //     feed: async(parent, args, context) => {
    //         return context.prisma.link.findMany()
    //     }
    // },

    // argsは引数の意味。url, descriptionを指す。
    // Mutation: {
    //     post: (parent, args, context) => {
    //         const newLink = context.prisma.link.create({
    //             data: {
    //                 url: args.url,
    //                 description: args.description
    //             }
    //         })

    //         return newLink

    //         // let idCount = links.length;
    //         // const link = {
    //         //     id: `link-${idCount++}`,
    //         //     descripton: args.descripton,
    //         //     url: args.url
    //         // }

    //         // links.push(link)

    //         // return link
    //     }
    // }
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
    resolvers,
    // resolvers関数内で、prismaという変数が使える。
    context: ({req}) => {
        return {
            // 今あるreqに対して、prismaとuserIdを追加する。
            ...req,
            prisma,
            pubsub,
            userId: req && req.headers.authorization ? getUserId(req) : null
        }
    }
})

// serverを立ち上げる。なぜかgit bushコマンドでは立ち上がらない。
// node ./src/server.js
server.listen().then(({ url}) => console.log(`${url}でサーバーを起動中・・・`))
