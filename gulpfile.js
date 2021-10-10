const project_folder = "build";
const source_folder = "source";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const scss = require("gulp-sass")(require('sass'));
const autoprefixer = require("autoprefixer");
const rename = require("gulp-rename");
const clean_css = require("gulp-clean-css");
const gulp_postcss = require("gulp-postcss");
const plumber = require("gulp-plumber");
const uglify = require('gulp-uglify-es').default;
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  source: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    scss: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg, png}",
    svg: source_folder + "/img/**/*.svg",
    fonts: source_folder + "/fonts/*.{woff, woff2}",
  },
  watch: {
    html: source_folder + "/**/*.html",
    scss: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg, png, svg}"
  },
  clean: "./" + project_folder + "/"
}

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.scss], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], img);
}

function clean() {
  return del(path.clean);
}

function html() {
  return src(path.source.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.source.scss)
    .pipe(plumber())
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      gulp_postcss([
        autoprefixer()
      ])
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.source.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function img() {
  return src(path.source.img)
    .pipe(webp())
    .pipe(dest(path.build.img))
    .pipe(src(path.source.img))
    .pipe(
      imagemin([
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [
            {removeViewBox: false}
          ]
        })
      ])
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.source.svg))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

const build = gulp.series(clean, gulp.parallel(img, js, css, html));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.build = build;
exports.watch = watch;
exports.default = watch;
