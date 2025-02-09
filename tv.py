import os

def traverse_and_write_structure(start_dir, output_file):
    with open(output_file, 'w') as f:
        for root, dirs, files in os.walk(start_dir):
            # Skip 'node_modules' and '.git' directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]

            # Write directory structure
            relative_path = os.path.relpath(root, start_dir)
            if relative_path != ".":
                f.write(f"{relative_path}/\n")
            else:
                f.write(f"{root}/\n")

            # Write file structure
            for file in files:
                file_path = os.path.join(root, file)
                relative_file_path = os.path.relpath(file_path, start_dir)
                f.write(f"{relative_file_path}\n")

if __name__ == "__main__":
    # Set the main directory and output txt file path
    main_dir = '.'  # Current directory or specify a path
    output_txt = 'project_structure.txt'

    traverse_and_write_structure(main_dir, output_txt)
    print(f"Project structure written to {output_txt}")
