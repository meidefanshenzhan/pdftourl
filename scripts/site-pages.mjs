export const sitePages=['zh','en'].flatMap(lang=>[
 {path:`/${lang}/`,lang,type:'home'},
 {path:`/${lang}/pdf-to-link/`,lang,type:'pdf'},
 {path:`/${lang}/word-counter/`,lang,type:'counter'},
 {path:`/${lang}/remove-duplicates/`,lang,type:'dedupe'},
 {path:`/${lang}/word-merge/`,lang,type:'merge'},
 {path:`/${lang}/acos-calculator/`,lang,type:'acos'},
 {path:`/${lang}/changelog/`,lang,type:'changelog'},
 {path:`/${lang}/bookmarks/`,lang,type:'bookmarks'},
 {path:`/${lang}/contact/`,lang,type:'contact'}
]);
