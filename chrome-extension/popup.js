const resultDiv = document.getElementById('result');


document.getElementById('get_content').addEventListener('click', async () => {
    const file_name = document.getElementById('save_file_name').value.trim();

    if (!file_name) {
        resultDiv.style['display'] = 'block';
        resultDiv.textContent = 'Имя файла не указано!';
        return;
    }

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getPageContent
        });

        if (results[0] && results[0].result) {
            const content = results[0].result;

            const file = new File([JSON.stringify(content)], file_name);
            const blob = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = blob;
            link.download = file_name;
            link.click();

            resultDiv.style['display'] = 'block';
            resultDiv.textContent = 'Арт скачан!';
        }
    } catch (error) {
        resultDiv.style['display'] = 'block';
        resultDiv.textContent = 'Ошибка: ' + error.message;
    }
});

function getPageContent() {
    function getDataFromLines(ascii_lines) {
        let lines = [];

        for (let i = 0; i < ascii_lines.length; i++) {
            let ascii_line = ascii_lines[i];
            lines.push([]);

            let spans = ascii_line.getElementsByTagName("span");
            for (let k = 0; k < spans.length; k++) {
                let span = spans[k];

                let fg = span.style['color'].split('(')[1].split(')')[0];
                let fg_r = Number(fg.split(',')[0]);
                let fg_g = Number(fg.split(',')[1]);
                let fg_b = Number(fg.split(',')[2]);

                let bg = span.style['background-color'].split('(')[1].split(')')[0];
                let bg_r = Number(bg.split(',')[0]);
                let bg_g = Number(bg.split(',')[1]);
                let bg_b = Number(bg.split(',')[2]);

                let symbol = span.textContent;
                let width = symbol.length;

                for(let s = 0; s < width; s++) {
                    lines[i].push([fg_r, fg_g, fg_b, bg_r, bg_g, bg_b, symbol[s]])
                }
            }

            console.log(lines[i].length)
        }

        return lines;
    }


    const content = {
        title: document.title,
        url: window.location.href,
        ascii_lines: document.getElementsByClassName("ascii-line")
    };

    const lines = getDataFromLines(content.ascii_lines);

    return lines;
}