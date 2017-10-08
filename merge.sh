#!/bin/bash

#--exclude "dist/app.qsa.search.bundle.js.map" \
rsync --recursive --verbose --progress \
--exclude ".git" \
--exclude ".gitignore.ifactory" \
--exclude "node_modules" \
--exclude "README.md" \
--exclude "dist/index.html" \
--exclude "src/public/index.html" \
--exclude "dist/.gitignore" \
--exclude "dist/products.csv" \
--exclude "dist/products_old.csv" \
--exclude "dist/dsiti/qsa/search/categories.json" \
--exclude "src/public/.gitignore" \
--exclude "src/public/products_old.csv" \
--exclude "merge.sh" \
--exclude "update_permission_dev.sh" \
. ../qsa-archive-search-commit/

cd ../qsa-archive-search-commit
git add --all
