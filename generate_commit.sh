generate_commit_message() {
    changed_files=$(git diff --name-only --staged)

    file_count=$(echo "$changed_files" | wc -l)

    has_frontend=false
    has_backend=false
    has_tests=false
    main_directory=""

    while IFS= read -r file; do 
    if [[ $file == frontend/* ]]; then
        has_frontend=true
    elif [[ $file == backend/* ]]; then 
        has_backend=true
    elif [[ $file == *test* || $file == *spec* ]]; then
        has_tests=true
    fi 

    dir=$(dirname "$file" | cut -d'/' -f1)
    if [[ -z $main_directory ]]; then 
        main_directory=$dir 
    elif [[ $main_directory != $dir ]]; then 
        main_directory="multiple"
    fi
done <<< "$changed_files"

if [[ $file_count -eq 1 ]]; then 
    message="Update $(basename "${changed_files}")"
else 
    message="Update $file_count files"
fi

if $has_frontend && $has_backend; then 
    message="$message in frontend and backend"
elif $has_frontend; then 
    message="$message in frontend"
elif $has_backend; then 
    message="$message in backend"
fi

if $has_tests; then 
    message="$message, including tests"
fi 

if [[ $main_directory != "multiple" ]]; then 
    message="$message in $main_directory"
fi 

    echo "$message"
}

commit_message=$(generate_commit_message)

echo "Предлагаемое сообщение коммита:"
echo "$commit_message"

read -p "Использовать это сообщение для коммита? (y/n): " answer

if [[ $answer == 'y' ]]; then 
    git commit -m "$commit_message"
    echo "Коммит создан с сообщением: $commit_message"
    else 
    echo "Коммит не был создан. Вы можете создать его вручную."
fi