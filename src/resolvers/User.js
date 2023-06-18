function links(parent, args, context){
    // databaseの中から、userのテーブルを探しに行く
    return context.prisma.user.findUnique({
        where: {id: parent.id}
    })
    .links()
}

module.exports = {
    links
}