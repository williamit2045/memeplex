document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('tagSearch');
    const topicSuggestions = document.getElementById('tagSuggestions');
    const selectedTags = document.getElementById('selectedTags');
    const hiddenTags = document.getElementById('hiddenTags');

    let selectedTagList = [];

    // Fetch topic suggestions
    topicInput.addEventListener('input', async () => {
        const query = topicInput.value.trim();
        if (query.length === 0) {
            topicSuggestions.innerHTML = '';
            topicSuggestions.classList.add('hidden');
            return;
        }

        const response = await fetch(`/tags/search?query=${query}`);
        const topics = await response.json();

        topicSuggestions.innerHTML = topics.map(topic => `<li class="p-2 cursor-pointer hover:bg-gray-100">${topic.name}</li>`).join('');
        topicSuggestions.classList.remove('hidden');
    });

    // Add selected topic to the list
    topicSuggestions.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const topic = event.target.textContent;
            if (!selectedTagList.includes(topic)) {
                selectedTagList.push(topic);
                selectedTags.innerHTML += `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${topic} <button type="button" class="ml-2 text-red-500 remove-tag" data-tag="${topic}">&times;</button></span>`;
            }
            topicInput.value = '';
            topicSuggestions.classList.add('hidden');
            hiddenTags.value = selectedTagList.join(',');
        }
    });

    // Remove a tag from the selected list
    selectedTags.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-tag')) {
            const topic = event.target.getAttribute('data-tag');
            selectedTagList = selectedTagList.filter(tag => tag !== topic);
            hiddenTags.value = selectedTagList.join(',');
            event.target.parentElement.remove();
        }
    });
});