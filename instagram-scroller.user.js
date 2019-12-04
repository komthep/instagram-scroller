// ==UserScript==
// @name         Instagram Scroller
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.instagram.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const username = window.location.pathname.split('/')[1]
    console.log({ username })
    const {
        count,
        ownerId
    } = window.location.search.split('&').reduce((query, segment, index) => {
        const [key, value] = index ? segment.split('=') : segment.slice(1).split('=')
        return {
            ...query,
            [key]: value
        }
    }, {})
    const totalCount = window._sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count

    const appendCounter = () => {
        const cjsCounter = document.createElement('div')
        cjsCounter.setAttribute('id', 'cjs-counter')
        cjsCounter.style.position = 'fixed'
        cjsCounter.style.top = '0px'
        cjsCounter.style.left = '20px'
        cjsCounter.style.color = 'red'
        cjsCounter.style.height = '50px'
        cjsCounter.style.lineHeight = '50px'
        cjsCounter.style.backgroundColor = 'white'
        document.body.append(cjsCounter)
    }

    const downloadText = (string) => {
        const blob = new Blob([string], {
            type: 'text/json;charset=utf-8'
        })
        const textFile = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = textFile
        a.download = `${username}.json`
        a.click()
    }

    if (username) {
        if (window.confirm('Are you sure to sync photos from this instagram account ?')) {
            let photos = []
            appendCounter()
            const _interval = setInterval(() => {
                const newPhotos = Array.from(document.querySelectorAll('a[href]'))
                .filter((index, anchor) => anchor.href.indexOf('https://www.instagram.com/p/') > -1)
                .map((index, anchor) => {
                    const img = anchor.children[0].children[0].children[0]
                    const imgSet = img.srcset.split(',')
                    return {
                        username,
                        ownerId,
                        link: anchor.href,
                        squareURL: imgSet[imgSet.length - 1].slice(0, -5),
                        alt: img.alt
                    }
                })
                .toArray()
                photos = photos.concat(newPhotos.filter(({
                    link
                }) => !photos.some(photo => photo.link === link)))
                document.getElementById('cjs-counter').innerHTML = `${photos.length} / ${totalCount - count} (${(((photos.length) / (totalCount - count)) * 100).toFixed(2)}% ...)`
                if (photos.length >= (totalCount - count)) {
                    document.getElementById('cjs-counter').style.display = 'none'
                    downloadText(JSON.stringify(photos))
                    clearInterval(_interval)
                    setTimeout(() => alert('Successfully download data of instagram photos.'), 1000)
                }
                document.querySelector('footer').scrollIntoView()
            }, 1000)
            }
    }
})();
