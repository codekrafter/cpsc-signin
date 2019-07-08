const TEXT_svg_template = `
<svg version="1.1" viewBox="0.0 0.0 353.90813648293965 503.87139107611546" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l353.90814 0l0 503.8714l-353.90814 0l0 -503.8714z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l353.90814 0l0 503.8714l-353.90814 0z" fill-rule="evenodd"/><defs><linearGradient id="p.1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(22.42681223980571 0.0 0.0 22.42681223980571 0.0 0.0)" spreadMethod="pad" x1="2.061758681387089E-10" y1="-5.695481507787358E-5" x2="-8.118462854766998E-5" y2="22.42675528484369"><stop offset="0.0" stop-color="#fff6db"/><stop offset="1.0" stop-color="#fad25c"/></linearGradient></defs><path fill="url(#p.1)" d="m0 58.809574l0 0c0 -32.47963 26.329943 -58.809574 58.809574 -58.809574l235.23126 0l0 0c15.5972595 0 30.555695 6.195991 41.584625 17.224926c11.028931 11.0289345 17.224945 25.987381 17.224945 41.58465l0 385.3415c0 32.479614 -26.329956 58.80957 -58.80957 58.80957l-235.23126 0c-32.47963 0 -58.809574 -26.329956 -58.809574 -58.80957z" fill-rule="evenodd"/><path stroke="#000000" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt" d="m0 58.809574l0 0c0 -32.47963 26.329943 -58.809574 58.809574 -58.809574l235.23126 0l0 0c15.5972595 0 30.555695 6.195991 41.584625 17.224926c11.028931 11.0289345 17.224945 25.987381 17.224945 41.58465l0 385.3415c0 32.479614 -26.329956 58.80957 -58.80957 58.80957l-235.23126 0c-32.47963 0 -58.809574 -26.329956 -58.809574 -58.80957z" fill-rule="evenodd"/><path fill="#6aa84f" d="m0.005249344 90.32284l352.8504 0l0 111.02361l-352.8504 0z" fill-rule="evenodd"/><path stroke="#000000" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt" d="m0.005249344 90.32284l352.8504 0l0 111.02361l-352.8504 0z" fill-rule="evenodd"/><path fill="#f3f3f3" d="m83.97638 43.026245l179.68503 0l0 219.08661l-179.68503 0z" fill-rule="evenodd"/><path stroke="#000000" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt" d="m83.97638 43.026245l179.68503 0l0 219.08661l-179.68503 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m-3.175853E-5 204.1588l352.8504 0l0 151.47212l-352.8504 0z" fill-rule="evenodd"/><g transform="matrix(1.7820727034120734 0.0 0.0 1.7820249343832022 -3.175853018372703E-5 204.15879160104984)"><clipPath id="p.2"><path d="m3.3881318E-21 0l198.0 0l0 85.0l-198.0 0z" clip-rule="evenodd"/></clipPath><image clip-path="url(#p.2)" fill="#000" width="198.0" height="85.0" x="0.0" y="0.0" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/></g><g filter="url(#shadowFilter-p.3)"><use xlink:href="#p.3" transform="matrix(1.0 0.0 0.0 1.0 0.0 9.0)"/></g><defs><filter id="shadowFilter-p.3" filterUnits="userSpaceOnUse"><feGaussianBlur in="SourceAlpha" stdDeviation="2.0" result="blur"/><feComponentTransfer in="blur" color-interpolation-filters="sRGB"><feFuncR type="linear" slope="0" intercept="0.0"/><feFuncG type="linear" slope="0" intercept="0.0"/><feFuncB type="linear" slope="0" intercept="0.0"/><feFuncA type="linear" slope="0.5" intercept="0"/></feComponentTransfer></filter></defs><g id="p.3"><path fill="#000000" fill-opacity="0.0" d="m8.923884 431.24152l335.0027 0l0 37.099762l-335.0027 0z" fill-rule="evenodd"/><g transform="matrix(0.5620850393700788 0.0 0.0 0.5621173228346457 8.923884514435695 431.24152519685043)"><clipPath id="p.4"><path d="m0 0l596.0 0l0 66.0l-596.0 0z" clip-rule="evenodd"/></clipPath><image clip-path="url(#p.4)" fill="#000" width="596.0" height="66.0" x="0.0" y="0.0" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/></g></g><path fill="#000000" fill-opacity="0.0" d="m67.72441 301.34384l212.18898 0l0 37.102356l-212.18898 0z" fill-rule="evenodd"/>
  
<style>
.staff { transform-origin: center; font: bold 50px "Comic Sans MS", "cursive", "sans-serif"; fill: black; }
.name { transform-origin: center; font: 30.5px "Comic Sans MS", "cursive", "sans-serif"; fill: black; }
</style>
<text text-anchor="middle" x="176.954068" y="330" class="staff">[[TITLE]]</text>
<text text-anchor="middle" x="176.954068" y="385" class="name">[[NAME]]</text>
<text text-anchor="middle" x="176.954068" y="415" class="name">[[YEAR]]</text>


<path fill="#000000" fill-opacity="0.0" d="m80.95276 39.341213l185.73306 0l0 226.45657l-185.73306 0z" fill-rule="nonzero"/><g transform="matrix(0.18032335958005247 0.0 0.0 0.18031803228010343 80.95275590551181 36.89548153811327)"><clipPath id="p.5"><path d="m0 13.56343l1030.0 0l0 1255.873l-1030.0 0z" clip-rule="nonzero"/></clipPath><image clip-path="url(#p.5)" fill="#000" width="1030.0" height="1283.0" x="0.0" y="0.0" preserveAspectRatio="none" xlink:href="[[IMAGE]]"/></g><path stroke="#38761d" stroke-width="2.0" stroke-linejoin="round" stroke-linecap="butt" d="m79.95276 38.341213l187.73306 0l0 228.45657l-187.73306 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m80.95276 394.1391l185.73227 0l0 37.102356l-185.73227 0z" fill-rule="evenodd"/></g></svg>
`