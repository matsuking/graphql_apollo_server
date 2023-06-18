function link(parent, args, context) {
    return context.prisma.link.findUnique({
        where: {
            id: parent.id
        }
    })
    .link()
}

function user(parent, args, context){
    return context.prisma.vote.findUnique({
        where: {id: parent.id}
    })
    .user()
}

module.exports = {
    link,
    user
}