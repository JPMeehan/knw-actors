import gulp from "gulp";
import dartSass from "node-sass";
import gulpSass from "gulp-sass";
import concat from "gulp-concat";
import { rollup } from "rollup";

const sass = gulpSass(dartSass);

function compileSCSS() {
  return gulp
    .src("./src/styles/*.scss")
    .pipe(concat("knw-actors.scss"))
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./"));
}

gulp.task("sass", compileSCSS);

async function compileJavascript() {
  const bundle = await rollup({
    input: "knw-actors.mjs",
    //   plugins: [nodeResolve()]
  });
  await bundle.write({
    file: "./knw-actors-compiled.mjs",
    format: "es",
    sourcemap: true,
    sourcemapFile: "knw-actors.mjs",
  });
}

gulp.task("mjs", compileJavascript);

gulp.task("buildAll", gulp.series(compileSCSS, compileJavascript));
