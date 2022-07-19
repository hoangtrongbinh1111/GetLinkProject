const INFORMATION_PIKBEST = {
    DOMAIN: "https://pikbest.com",
    ACCOUNT: "jianmy@gmail.com",
    PASSWORD: "burltable98",
    DOWNLOAD: [
        {
            DOWNLOAD_TYPE: 0,
            DOWNLOAD_NAME: "PNG",
            DOWNLOAD_ELEMENT: "a.dlbtn.dljpg.ga-click",
            DOWNLOAD_RESOURCE: [
                "https://zip.pikbest.com"
            ]
        },
        {
            DOWNLOAD_TYPE: 1,
            DOWNLOAD_NAME: "PSD",
            DOWNLOAD_ELEMENT: "a.block-gradient.graHover.dlbtn.ga-click",
            DOWNLOAD_RESOURCE: [
                "https://zip.pikbest.com",
                "https://proxy-t"
            ]
        }
    ],
    DOWNLOAD_ELEMENT: "a.block-gradient.graHover.dlbtn.ga-click"
    
};
const INFORMATION_PNGTREE = {
    DOMAIN: "https://vi.pngtree.com/",
    ACCOUNT: "vuongle.201096@gmail.com",
    PASSWORD: "rollie3011",
    DOWNLOAD: [
        {
            DOWNLOAD_TYPE: 0,
            DOWNLOAD_NAME: "PNG",
            DOWNLOAD_ELEMENT: ".btn-downjpg",
            DOWNLOAD_RESOURCE: [
                "https://proxy-rar.pngtree.com/"
            ]
        },
        {
            DOWNLOAD_TYPE: 1,
            DOWNLOAD_NAME: "EPS",
            DOWNLOAD_ELEMENT: ".btn-downeps",
            DOWNLOAD_RESOURCE: [
                "https://proxy-rar.pngtree.com",
                "https://proxy-t"
            ]
        }
    ],
    DOWNLOAD_ELEMENT: ".btn-downeps"
    
};
module.exports = {
    INFORMATION_PIKBEST,
    INFORMATION_PNGTREE
}