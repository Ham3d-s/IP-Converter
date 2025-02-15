'use strict';
// Declare variables for quizIP and quizBinary
var quizIP = '';
var quizBinary = '';

// Function to convert an IP address to binary
function convertToBinary() {
    var ip = document.getElementById('ip').value;
    var ipParts = ip.split('.');
    var binaryParts = [];
    var mathSteps = [];

    if (ipParts.length !== 4) {
        alert("آدرس IP نامعتبر است. لطفاً یک آدرس IPv4 معتبر وارد کنید.");
        return;
    }

    for (var i = 0; i < ipParts.length; i++) {
        var part = ipParts[i];

        if (!isNumeric(part) || part < 0 || part > 255) {
            alert("آدرس IP نامعتبر است. لطفاً یک آدرس IPv4 معتبر وارد کنید.");
            return;
        }

        var binaryPart = parseInt(part).toString(2);
        var mathStep = '';

        while (binaryPart.length < 8) {
            binaryPart = '0' + binaryPart;
            mathStep = '0' + mathStep;
        }

        binaryParts.push(binaryPart);
        mathSteps.push(mathStep);
    }

    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = binaryParts.join('.');

    var stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';
    var mathStepsDiv = document.getElementById('mathStepsBody');
    mathStepsDiv.innerHTML = '';

    for (var i = 0; i < ipParts.length; i++) {
        stepsDiv.innerHTML += 'عدد ' + ipParts[i] + ' به باینری ' + binaryParts[i] + ' تبدیل می‌شود<br>';
        var process = calculateProcess(ipParts[i]);
        mathStepsDiv.innerHTML += '<tr><th scope="row" class="px-6 py-4 font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800 whitespace-nowrap">' + ipParts[i] + '</th><td class="px-6 py-4">' + process + '</td><td class="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800">' + binaryParts[i] + '</td></tr>';
    }
}

// Function to calculate the binary conversion process
function calculateProcess(decimal) {
    var powers = [128, 64, 32, 16, 8, 4, 2, 1];
    var binaryConversionProcess = '';
    var remainder = decimal;

    for (var i = 0; i < powers.length; i++) {
        if (remainder >= powers[i]) {
            binaryConversionProcess += powers[i] + '-' + remainder + '=' + (remainder - powers[i]) + ' (1)، ';
            remainder -= powers[i];
        } else {
            binaryConversionProcess += '0، ';
        }
    }

    return binaryConversionProcess.slice(0, -2);
}

// Function to determine the class of the IP address
function getClass(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) {
        return 'A';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return 'B';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return 'C';
    } else if (firstOctet >= 224 && firstOctet <= 239) {
        return 'Multicast';
    } else if (firstOctet >= 240 && firstOctet <= 255) {
        return 'Multicast';
    } else {
        return 'Invalid';
    }
}

// Function to get the network ID of the IP address
function getNetID(firstOctet, ipParts) {
    var netIDParts = [];

    if (firstOctet >= 1 && firstOctet <= 126) {
        netIDParts.push(ipParts[0]);
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        netIDParts.push(ipParts[0] + '.' + ipParts[1]);
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        netIDParts.push(ipParts[0] + '.' + ipParts[1] + '.' + ipParts[2]);
    } else {
        return 'Invalid';
    }

    return netIDParts.join('.');
}

// Function to get the host ID of the IP address
function getHostID(firstOctet, ipParts) {
    var hostIDParts = [];

    if (firstOctet >= 1 && firstOctet <= 126) {
        hostIDParts.push(ipParts[1] + '.' + ipParts[2] + '.' + ipParts[3]);
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        hostIDParts.push(ipParts[2] + '.' + ipParts[3]);
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        hostIDParts.push(ipParts[3]);
    } else {
        return 'Invalid';
    }

    return hostIDParts.join('.');
}

// Function to get the network number
function getNN(firstOctet, ipParts) {
    let ipStructure = [];

    if (firstOctet >= 1 && firstOctet <= 126) {
        ipStructure.push(ipParts[0] + '.0.0.0');
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        ipStructure.push(ipParts[0] + '.' + ipParts[1] + '.0.0');
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        ipStructure.push(ipParts[0] + '.' + ipParts[1] + '.' + ipParts[2] + '.0');
    } else {
        return 'Invalid';
    }

    return ipStructure.join('.');
}

// Function to get the broadcast address
function getBA(firstOctet, ipParts) {
    var baParts = [];

    if (firstOctet >= 1 && firstOctet <= 126) {
        baParts.push(ipParts[0] + '.255.255.255');
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        baParts.push(ipParts[0] + '.' + ipParts[1] + '.255.255');
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        baParts.push(ipParts[0] + '.' + ipParts[1] + '.' + ipParts[2] + '.255');
    } else {
        return 'Invalid';
    }

    return baParts.join('.');
}

// Function to get the subnet mask
function getSubnetMask(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) {
        return '255.0.0.0';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return '255.255.0.0';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return '255.255.255.0';
    } else {
        return 'Invalid';
    }
}

// Function to get the net worth
function getNetWorth(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) {
        return '/8';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return '/16';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return '/24';
    } else {
        return 'Invalid';
    }
}

// Function to get the number of networks
function getNumberOfNetworks(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) {
        return '128';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return '16,384';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return '2,097,152';
    } else {
        return 'Invalid';
    }
}

// Function to get the number of hosts
function getNumberOfHosts(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) {
        return '16,777,214';
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return '65,534';
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return '254';
    } else {
        return 'Invalid';
    }
}

// Function to generate a random IP address
function generateRandomIP() {
    var ipParts = [];

    for (var i = 0; i < 4; i++) {
        ipParts.push(Math.floor(Math.random() * 256));
    }

    document.getElementById('ip').value = ipParts.join('.');
}

// Function to start the IP conversion quiz
function startQuiz() {
    // Clear previous quiz and results
    document.getElementById('quiz').innerHTML = '';
    document.getElementById('quizResult').innerHTML = '';
    document.getElementById('quizBinary').innerHTML = '';
    document.getElementById('quizResultBinary').innerHTML = '';

    // Generate a random IP and its binary representation for the quiz
    var randomIP = generateRandomIPForQuiz();
    quizIP = getBinaryFromIP(randomIP);

    // Display the IP conversion quiz
    document.getElementById('quiz').innerHTML = `
        <div class="quizContent">
            <div class="quizTitle">تبدیل آدرس IP زیر به باینری:</div>
            <div class="quiz-question">${randomIP}</div>
            <input id="quizInput" type="text"
                   class="fancy-input"
                   placeholder="باینریِ IP را وارد کنید">
            <div class="button-group">
                <button onclick="checkQuiz()" class="btn">
                    <i class="material-icons">check</i>
                    محاسبه
                </button>
                <button onclick="document.getElementById('quizInput').value = '${quizIP}'" class="btn">
                    <i class="material-icons">visibility</i>
                    نمایش
                </button>
            </div>
        </div>
    `;

    // Generate a random binary and its IP representation for the quiz
    var randomBinary = generateRandomBinaryForQuiz();
    quizBinary = getIPFromBinary(randomBinary);

    // Display the binary conversion quiz
    document.getElementById('quizBinary').innerHTML = `
        <div class="quizContent">
            <div class="quizTitle">تبدیل باینری زیر به آدرس IP:</div>
            <div class="quiz-question">${randomBinary}</div>
            <input id="quizInputBinary" type="text"
                   class="fancy-input"
                   placeholder="آی پی را وارد کنید">
            <div class="button-group">
                <button onclick="checkQuizBinary()" class="btn">
                    <i class="material-icons">check</i>
                    محاسبه
                </button>
                <button onclick="document.getElementById('quizInputBinary').value = '${quizBinary}'" class="btn">
                    <i class="material-icons">visibility</i>
                    نمایش
                </button>
            </div>
        </div>
    `;
}

// Function to generate a random IP address for the quiz
function generateRandomIPForQuiz() {
    var ipParts = [];

    // Generate 4 random octets and join them with periods to form an IP address
    for (var i = 0; i < 4; i++) {
        ipParts.push(Math.floor(Math.random() * 256));
    }

    return ipParts.join('.');
}

// Function to generate a random binary for the quiz
function generateRandomBinaryForQuiz() {
    var binaryParts = [];

    // Generate 4 random binary octets and join them with periods to form a binary representation
    for (var i = 0; i < 4; i++) {
        binaryParts.push(Math.floor(Math.random() * 256).toString(2));
    }

    return binaryParts.join('.');
}

// Function to check the IP conversion quiz answer
function checkQuiz() {
    var userInput = document.getElementById('quizInput').value;
    var resultElement = document.getElementById('quizResult');

    if (userInput === quizIP) {
        resultElement.innerHTML = `
            <div class="result-indicator correct">
                <i class="material-icons">check_circle</i>
                جواب درست است
            </div>`;
    } else {
        resultElement.innerHTML = `
            <div class="result-indicator incorrect">
                <i class="material-icons">error</i>
                جواب اشتباه است
            </div>`;
    }
}

// Function to check the binary conversion quiz answer
function checkQuizBinary() {
    var userInput = document.getElementById('quizInputBinary').value;
    var resultElement = document.getElementById('quizResultBinary');

    if (userInput === quizBinary) {
        resultElement.innerHTML = `
            <div class="result-indicator correct">
                <i class="material-icons">check_circle</i>
                جواب درست است
            </div>`;
    } else {
        resultElement.innerHTML = `
            <div class="result-indicator incorrect">
                <i class="material-icons">error</i>
                جواب اشتباه است
            </div>`;
    }
}

// Function to reset the page
function resetPage() {
    // Clear all input fields and result sections
    document.getElementById('ip').value = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('steps').innerHTML = '';
    document.getElementById('mathStepsBody').innerHTML = '';
    document.getElementById('ipAnalysisBody').innerHTML = '';
    document.getElementById('quiz').innerHTML = '';
    document.getElementById('quizResult').innerHTML = '';
    document.getElementById('quizBinary').innerHTML = '';
    document.getElementById('quizResultBinary').innerHTML = '';

    // New code to close accordion sections:
    var accordionContents = document.querySelectorAll('.accordion-content');
    accordionContents.forEach(function (content) {
        content.style.display = 'none';
    });
}


// Function to check if a value is numeric
function isNumeric(value) {
    return /^\d+$/.test(value);
}

// Function to show IP analysis
function showAnalysis() {
    // Get the entered IP address and its parts
    var ip = document.getElementById('ip').value;
    var ipParts = ip.split('.');
    var firstOctet = parseInt(ipParts[0]);

    // Calculate various IP analysis results
    var classResult = getClass(firstOctet);
    var netIDResult = getNetID(firstOctet, ipParts);
    var hostIDResult = getHostID(firstOctet, ipParts);
    var nnResult = getNN(firstOctet, ipParts);
    var baResult = getBA(firstOctet, ipParts);
    var subnetMaskResult = getSubnetMask(firstOctet);
    var netWorthResult = getNetWorth(firstOctet);
    var numberOfNetworksResult = getNumberOfNetworks(firstOctet);
    var numberOfHostsResult = getNumberOfHosts(firstOctet);

    // Clear previous analysis results
    var ipAnalysisBody = document.getElementById('ipAnalysisBody');
    ipAnalysisBody.innerHTML = '';

    // Display the IP analysis in a table format
    ipAnalysisBody.innerHTML += '<tr><th scope="row" class="px-6 py-4 font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800 whitespace-nowrap">' + classResult + '</th><td class="px-6 py-4">' + netIDResult + '</td><td class="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800">' + hostIDResult + '</td><td class="px-6 py-4">' + nnResult + '</td><td class="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800">' + baResult + '</td><td class="px-6 py-4">' + subnetMaskResult + '</td><td class="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800">' + netWorthResult + '</td><td class="px-6 py-4">' + numberOfNetworksResult + '</td><td class="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white dark:bg-gray-800">' + numberOfHostsResult + '</td></tr>';
}

// Function to convert IP address to binary
function getBinaryFromIP(ip) {
    var ipParts = ip.split('.');
    var binaryParts = [];

    // Convert each octet to binary and ensure it is 8 bits long
    for (var i = 0; i < ipParts.length; i++) {
        var part = ipParts[i];
        var binaryPart = parseInt(part).toString(2);

        while (binaryPart.length < 8) {
            binaryPart = '0' + binaryPart;
        }

        binaryParts.push(binaryPart);
    }

    return binaryParts.join('.');
}

// Function to convert binary to IP address
function getIPFromBinary(binary) {
    var binaryParts = binary.split('.');
    var ipParts = [];

    // Convert each binary octet to decimal
    for (var i = 0; i < binaryParts.length; i++) {
        var part = binaryParts[i];
        var decimalPart = parseInt(part, 2).toString();

        ipParts.push(decimalPart);
    }

    return ipParts.join('.');
}

// get all accordion headers
var acc = document.getElementsByClassName("accordion-header");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        // toggle display of the next sibling element (which is the accordion-content)
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

window.onload = function () {
    var accContent = document.querySelectorAll('.accordion-content');
    accContent.forEach(function (content) {
        content.style.display = 'none';
    });
}

// Add this at the start of your script section
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const icon = document.querySelector('.theme-toggle i');
    icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
}

// Set initial theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.querySelector('.theme-toggle i');
    icon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
});

// IPv6 Functions
function validateIPv6(ip) {
    const regex = /^(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|:)$/;
    return regex.test(ip);
}

function convertIPv6ToBinary(ip) {
    return ip.split(':').map(chunk => {
        let binary = parseInt(chunk, 16).toString(2);
        return '0'.repeat(16 - binary.length) + binary;
    }).join(':');
}

// Mode Switch
let currentMode = 'ipv4';
function setMode(mode) {
    currentMode = mode;
    document.getElementById('ipv4-mode').classList.toggle('active', mode === 'ipv4');
    document.getElementById('ipv6-mode').classList.toggle('active', mode === 'ipv6');
    // Update placeholder and validation based on mode
    const input = document.getElementById('ip');
    input.placeholder = mode === 'ipv4' ?
        'مثال: 192.168.1.1' :
        'مثال: 2001:0db8:85a3:0000:0000:8a2e:0370:7334';
}

// Export Functions
function showExportModal() {
    document.getElementById('exportModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function exportAs(format) {
    const data = {
        ip: document.getElementById('ip').value,
        binary: document.getElementById('result').innerText,
        steps: document.getElementById('steps').innerText,
        analysis: document.getElementById('ipAnalysis').innerText
    };

    switch (format) {
        case 'pdf':
            exportToPDF(data);
            break;
        case 'json':
            exportToJSON(data);
            break;
        case 'txt':
            exportToTXT(data);
            break;
        case 'csv':
            exportToCSV(data);
            break;
    }
    closeModal('exportModal');
}

// Keyboard Shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey) {
        switch (e.key) {
            case '4':
                setMode('ipv4');
                break;
            case '6':
                setMode('ipv6');
                break;
            case 'r':
                generateRandomIP();
                break;
            case 'Enter':
                convertToBinary();
                break;
            case 'e':
                showExportModal();
                break;
            case 'q':
                startQuiz();
                break;
        }
        e.preventDefault();
    } else if (e.key === 'Escape') {
        closeModal('exportModal');
        closeModal('shortcutsModal');
    }
});

function showShortcutsModal() {
    document.getElementById('shortcutsModal').style.display = 'block';
}

// Export Implementation Functions
function exportToPDF(data) {
    // Using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(JSON.stringify(data, null, 2), 10, 10);
    doc.save('ip-conversion.pdf');
}

function exportToJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveFile(blob, 'ip-conversion.json');
}

function exportToTXT(data) {
    const text = Object.entries(data)
        .map(([key, value]) => `${key}:\n${value}\n`)
        .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    saveFile(blob, 'ip-conversion.txt');
}

function exportToCSV(data) {
    const csv = Object.entries(data)
        .map(([key, value]) => `${key},${value.replace(/\n/g, ' ')}`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    saveFile(blob, 'ip-conversion.csv');
}

function saveFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}