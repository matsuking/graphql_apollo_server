// データベースにアクセスするためのクライアントライブラリ
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient();


async function main(){
    // shema.prismaで定義したテーブル名を使う。
    const newLink = await prisma.link.create({
        data: {
            description: "GraphQLのチュートリアルを学ぶ",
            url: "www.graphQl.com"
        }
    })

    const allLinks = await prisma.link.findMany()
    console.log(allLinks)
}

main()
.catch((e) => {
    throw e;
})
.finally(async () => {
    // データベース接続を閉じる
    prisma.$disconnect
})