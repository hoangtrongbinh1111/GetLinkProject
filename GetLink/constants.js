const TYPE_PIKBEST = 0;
const TYPE_PNGTREE = 1;
const TYPE_FREEPIK = 2;
const INFORMATION = [
    {
        type: TYPE_PIKBEST,
        domain_name: "https://pikbest.com",
        account: "jianmy@gmail.com",
        password: "burltable98",
        cookie: "auth_id",
        downnload_resource: [
            "https://zip.pikbest.com",
            "https://proxy-"
        ]
    },
    {
        type: TYPE_PNGTREE,
        domain_name: "https://pngtree.com",
        account: "vuongle.201096@gmail.com",
        password: "rollie3011",
        cookie: "auth_uid",
        downnload_resource: [
            "https://down-yuantu.pngtree.com",
            "https://proxy-"
        ]
    },
]
module.exports = {
    INFORMATION,
    TYPE_PIKBEST,
    TYPE_PNGTREE
} 