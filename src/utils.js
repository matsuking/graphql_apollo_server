const jwt = require("jsonwebtoken")

// set secret key
APP_SECRET = "Graphql-is-aaaa"

// トークンを複合するための関数
function getTokenPayload(token){
    // トークン化された者の前の情報（user.id）を複合する
    return jwt.verify(token, APP_SECRET)
}

// ユーザーIDを取得するための関数
function getUserId(req, authToken){
    if (req) {
        // ヘッダーを確認する。認証権限があります？の確認
        const authHeader = req.headers.authorixation
        // 権限があるなら
        if (authHeader) {
            // authHeaderはBearer_token・・・というテキストで入ってくる
            const token = authHeader.replace("Bearer", "")

            if (!token){
                throw new Error("トークンが見つかりませんでした")
            }

            // そのトークンを複合する
            const { userId } = getTokenPayload(token)
            
            return userId
        } else if (authToken){
            const { userId } = getTokenPayload(authToken)
            return userId
        }
    }

    throw new Error("認証権限がありません。")
}


module.exports = {
    APP_SECRET,
    getUserId
}