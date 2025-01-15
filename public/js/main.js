document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('tagSearch');
    const topicSuggestions = document.getElementById('tagSuggestions');
    const selectedTags = document.getElementById('selectedTags');
    const hiddenTags = document.getElementById('hiddenTags');

    let selectedTagList = [];

    // Fetch topic suggestions as the user types
    topicInput.addEventListener('input', async () => {
        const query = topicInput.value.trim();
        if (query.length < 2) {
            topicSuggestions.innerHTML = '';
            topicSuggestions.classList.add('hidden');
            return;
        }

        const response = await fetch(`/tags/search?query=${query}`);
        const topics = await response.json();

        topicSuggestions.innerHTML = topics
            .map(topic => `<div class="p-2 cursor-pointer hover:bg-gray-200" data-tag="${topic.name}">${topic.name}</div>`)
            .join('');
        topicSuggestions.classList.remove('hidden');
    });

    // Add a topic to the selected list
    topicSuggestions.addEventListener('click', (event) => {
        const topic = event.target.getAttribute('data-tag');
        if (!topic || selectedTagList.includes(topic)) return;

        selectedTagList.push(topic);
        updateSelectedTags();
        topicInput.value = '';
        topicSuggestions.classList.add('hidden');
    });

    // Remove a tag from the selected list
    selectedTags.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-tag')) {
            const topic = event.target.getAttribute('data-tag');
            selectedTagList = selectedTagList.filter(tag => tag !== topic);
            updateSelectedTags();
        }
    });

    // Update the displayed tags and hidden form input
    function updateSelectedTags() {
        selectedTags.innerHTML = selectedTagList
            .map(tag => `
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    ${tag} 
                    <button type="button" class="ml-2 text-red-500 remove-tag" data-tag="${tag}">&times;</button>
                </span>
            `)
            .join('');
        hiddenTags.value = selectedTagList.join(',');
    }
});
