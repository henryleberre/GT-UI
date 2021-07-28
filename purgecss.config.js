module.exports = {
    content: [
        'src/content/gtui.html',
        'src/content/main.js'
    ],
    css: [
        'src/lib/tailwind.min.css'
    ],
    defaultExtractor: content => content.match(/[\w-:/]+(?<!:)/g) || []
}