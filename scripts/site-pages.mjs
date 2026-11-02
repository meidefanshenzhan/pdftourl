export const sitePages=['zh','en'].flatMap(lang=>[
 {path:`/${lang}/`,lang,type:'home'},
 {path:`/${lang}/pdf-to-link/`,lang,type:'pdf'},
 {path:`/${lang}/word-counter/`,lang,type:'counter'},
 {path:`/${lang}/remove-duplicates/`,lang,type:'dedupe'},
 {path:`/${lang}/word-merge/`,lang,type:'merge'},
 {path:`/${lang}/remove-words-from-text/`,lang,type:'filter'},
 {path:`/${lang}/image-compressor/`,lang,type:'image'},
 {path:`/${lang}/keyword-coverage-checker/`,lang,type:'coverage'},
 {path:`/${lang}/text-compare/`,lang,type:'compare'},
 {path:`/${lang}/image-to-pdf/`,lang,type:'imagePdf'},
 {path:`/${lang}/image-url/`,lang,type:'imageUrl'},
 {path:`/${lang}/acos-calculator/`,lang,type:'acos'},
 {path:`/${lang}/auto-subtitles/`,lang,type:'subtitles'},
 {path:`/${lang}/changelog/`,lang,type:'changelog'},
 {path:`/${lang}/bookmarks/`,lang,type:'bookmarks'},
 {path:`/${lang}/contact/`,lang,type:'contact'}
]);
