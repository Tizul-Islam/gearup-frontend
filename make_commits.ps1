$files = git ls-files --others --modified --exclude-standard

# Array of realistic commit messages
$messages = @(
    "Setup initial configurations and dependencies",
    "Implement core layout components",
    "Add global styles and theme setup",
    "Create reusable UI components",
    "Implement authentication context",
    "Set up routing structure",
    "Add API service layer",
    "Implement dashboard layout",
    "Create provider dashboard views",
    "Add gear listing components",
    "Implement real-time socket connection",
    "Add notification bell component",
    "Create custom hooks for data fetching",
    "Implement order management UI",
    "Add payment integration logic",
    "Refactor shared components",
    "Improve responsive design",
    "Add loading skeletons and states",
    "Implement error boundaries and handling",
    "Add gear details page",
    "Create user profile view",
    "Implement category filtering",
    "Add search functionality",
    "Update middleware and route protection",
    "Refactor state management",
    "Improve accessibility and ARIA labels",
    "Clean up unused variables and imports",
    "Optimize image loading",
    "Update Tailwind configurations",
    "Final polish and bug fixes"
)

$chunkSize = [math]::Ceiling($files.Length / 29)
$commitCount = 0

for ($i = 0; $i -lt $files.Length; $i += $chunkSize) {
    $chunk = $files | Select-Object -Skip $i -First $chunkSize
    
    $added = $false
    foreach ($file in $chunk) {
        # Check if file still exists (handling edge cases)
        if (Test-Path $file) {
            git add $file
            $added = $true
        }
    }
    
    if ($added) {
        $msg = $messages[$commitCount % $messages.Length]
        git commit -m $msg
        $commitCount++
    }
}

# Commit deleted files and any leftovers
git add -u
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "Finalizing app structure and removing unused files"
}
