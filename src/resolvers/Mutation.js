const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const {APP_SECRET} = require("../utils")

// ユーザーの新規登録のリゾルバ
async function signup(parent, args, context){
    
    // パスワードの設定
    const password = await bcrypt.hash(args.password, 10)

    // ユーザーの新規作成
    const user = await context.prisma.user.create({
        data: {
            /// argsには、email, password, nameが入り、passwordだけを更新する。
            ...args, 
            password
        }
    })
    
    // 署名, APP_SECRETがないと暗号化された文字列を元の文字列に戻せない？
    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {token, user}
}

// ユーザーログイン
// 登録されたemailを探しに行き、入力されたパスワードとハッシュ化されているパスワードの照合
async function login(parent, args, context){
    // findUniqueで単一のデータを取得する。idとかemailとか
    const user = await context.prisma.user.findUnique({
        // sqlのwhere文をイメージ
        where: {email: args.email},
    })
    if (!user) {
        throw new Error("そのようなユーザーは存在しません")
    }

    // パスワードの比較
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid){
        throw new Error("無効なパスワードです")
    }

    // パスワードが正しいとき（ハッシュ化？）
    const token = jwt.sign({
        userId: user.id
    }, APP_SECRET)

    return {
        token,
        user
    }
}

// ニュースを投稿するリゾルバ
async function post(parent, args, context){
    const { userId } = context
    console.log(userId)
    
    const newLink = await context.prisma.link.create({
        data : {
            url: args.url,
            description: args.description,
            postedBy: { connect: {id: userId}}
        }
    })

    // 送信
    context.pubsub.publish("NEW_LINK", newLink)

    return newLink
}

async function vote(parent, args, context){
    const userId = context.userId;

    // そもそも投票されているかの確認
    const vote = context.prisma.vote.findUnique({
        where: {
            linkId_userId: {
                linkId: Number(args.linkId),
                userId: userId,
            }
        }
    })

    // 2回投票を防ぐ
    if (Boolean(vote)) {
        throw new Error(`すでにその投稿には投票されています：${args.linkId}`)
    }

    // 投票する
    const newVote = context.prisma.vote.create({
        data: {
            // connectは、userとidは関係がありますよ、と明示するために使う。
            user: {connect: {id: userId}},
            link: {connect: {id: Number(args.linkId)}}
        }
    })

    // 送信する側
    context.pubsub.publish("NEW_VOTE", newVote)

    return newVote
}


module.exports = {
    signup,
    login,
    post,
    vote
}