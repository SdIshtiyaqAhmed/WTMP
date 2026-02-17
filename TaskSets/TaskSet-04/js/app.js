/**
 * Main Application Logic
 * Showcases: ES6 features, Spread operator, Object destructuring, Event handling
 */
import { initialStudents } from './data.js';
import { 
    calculateAverage, 
    getLetterGrade, 
    filterByGrade, 
    findStudent, 
    storage, 
    simulateAsyncLoad 
} from './utils.js';

// Application State
let students = [];
let currentView = 'dashboard';

// DOM Elements
const viewContainer = document.getElementById('view-container');
const studentForm = document.getElementById('studentForm');
const dashboardList = document.getElementById('dashboardList');
const studentCardsContainer = document.getElementById('studentCardsContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

/**
 * Initialize Application
 */
const init = async () => {
    loadingOverlay.classList.remove('hidden');
    
    // Load from storage or use initial data
    const savedData = storage.load('gm_students');
    const rawData = savedData || initialStudents;
    
    // Demonstrate Promise usage
    students = await simulateAsyncLoad(rawData);
    
    loadingOverlay.classList.add('hidden');
    updateUI();
    setupEventListeners();
};

/**
 * Update the whole UI based on current state
 */
const updateUI = () => {
    renderDashboard();
    renderStudentList();
    renderStats();
    renderReport();
};

/**
 * Render Dashboard Table
 * Showcases: map(), Template literals
 */
const renderDashboard = () => {
    dashboardList.innerHTML = students.slice(0, 5).map(student => {
        const { name, grades } = student; // Object destructuring
        const avg = calculateAverage(grades);
        const letter = getLetterGrade(avg);
        
        return `
            <tr>
                <td><strong>${name}</strong></td>
                <td>${grades.value1}</td>
                <td>${grades.value2}</td>
                <td>${grades.value3}</td>
                <td>${avg}%</td>
                <td><span class="grade-pill grade-${letter}">${letter}</span></td>
            </tr>
        `;
    }).join('');
};

/**
 * Render Full Student List with Filters
 * Showcases: filter(), map()
 */
const renderStudentList = () => {
    const filterVal = document.getElementById('gradeFilter').value;
    const sortVal = document.getElementById('sortControl').value;
    
    let filtered = filterByGrade(students, filterVal);
    
    // Sort logic
    filtered.sort((a, b) => {
        if (sortVal === 'name-asc') return a.name.localeCompare(b.name);
        if (sortVal === 'name-desc') return b.name.localeCompare(a.name);
        const avgA = parseFloat(calculateAverage(a.grades));
        const avgB = parseFloat(calculateAverage(b.grades));
        return sortVal === 'grade-desc' ? avgB - avgA : avgA - avgB;
    });

    studentCardsContainer.innerHTML = filtered.map(student => {
        const { name, id, grades } = student;
        const avg = calculateAverage(grades);
        const letter = getLetterGrade(avg);

        return `
            <div class="student-card">
                <div class="card-header">
                    <div class="student-info">
                        <h4>${name}</h4>
                        <span>ID: ${id}</span>
                    </div>
                    <span class="grade-pill grade-${letter}">${letter}</span>
                </div>
                <div class="subjects-row">
                    ${Object.entries(grades).map(([subj, score]) => `
                        <div class="subject-item">
                            <span style="text-transform: capitalize;">${subj}</span>
                            <strong>${score}</strong>
                        </div>
                    `).join('')}
                </div>
                <div class="card-footer" style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem; font-weight: 600;">AVG: ${avg}%</span>
                    <button class="btn-delete" data-id="${id}" style="color: var(--accent-danger); border: none; background: none; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </div>
            </div>
        `;
    }).join('');
};

/**
 * Render Statistics View
 * Showcases: reduce(), arrow functions
 */
const renderStats = () => {
    const total = students.length;
    document.getElementById('totalStudentsCount').textContent = total;

    if (total === 0) return;

    // Calculate system average using reduce
    const systemAvg = (students.reduce((acc, s) => acc + parseFloat(calculateAverage(s.grades)), 0) / total).toFixed(1);
    document.getElementById('classAverageScore').textContent = `${systemAvg}%`;

    // Find top performer using reduce
    const topPerformer = students.reduce((top, s) => {
        const curAvg = parseFloat(calculateAverage(s.grades));
        const topAvg = parseFloat(calculateAverage(top.grades));
        return curAvg > topAvg ? s : top;
    });
    document.getElementById('topPerformerName').textContent = topPerformer.name;

    // Calculate passing rate (avg >= 60)
    const passingCount = students.filter(s => calculateAverage(s.grades) >= 60).length;
    document.getElementById('passingRate').textContent = `${((passingCount / total) * 100).toFixed(0)}%`;
};

/**
 * Render Reports View
 */
const renderReport = () => {
    const reportSummary = document.getElementById('reportSummary');
    const sortedStudents = [...students].sort((a,b) => calculateAverage(b.grades) - calculateAverage(a.grades));
    
    const top3 = sortedStudents.slice(0, 3);
    const bottom3 = sortedStudents.slice(-3).reverse();

    // Showcase template literals for complex strings
    reportSummary.innerHTML = `
        <div class="report-section">
            <h3 style="margin-bottom: 1rem;">Highest Entries</h3>
            <ul>
                ${top3.map(s => `<li>${s.name} - ${calculateAverage(s.grades)}%</li>`).join('')}
            </ul>
        </div>
        <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid #e2e8f0;">
        <div class="report-section">
            <h3 style="margin-bottom: 1rem;">Entries Below Range</h3>
            <ul>
                ${bottom3.map(s => `<li>${s.name} - ${calculateAverage(s.grades)}%</li>`).join('')}
            </ul>
        </div>
    `;
};

/**
 * Event Listeners
 */
const setupEventListeners = () => {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view);
        });
    });

    // Form Submission
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Destructure input values
        const name = document.getElementById('studentName').value.trim();
        const id = document.getElementById('studentId').value.trim();
        
        // Custom ES6 Validation using some() and every()
        const gradesInputs = ['mathGrade', 'scienceGrade', 'englishGrade', 'historyGrade'];
        const isGradesValid = gradesInputs.every(id => {
            const val = parseInt(document.getElementById(id).value);
            return !isNaN(val) && val >= 0 && val <= 100;
        });

        if (name.length < 3 || !isGradesValid) {
            showNotification("Please ensure all fields are valid.", "error");
            return;
        }

        const grades = {
            value1: parseInt(document.getElementById('mathGrade').value),
            value2: parseInt(document.getElementById('scienceGrade').value),
            value3: parseInt(document.getElementById('englishGrade').value),
            value4: parseInt(document.getElementById('historyGrade').value)
        };

        // Create new record using spread for merging if needed
        const newStudent = {
            id,
            name,
            grades,
            addedAt: new Date().toISOString()
        };

        // Update state using spread operator
        students = [newStudent, ...students];
        
        storage.save('gm_students', students);
        showNotification(`Entry ${name} added.`);
        studentForm.reset();
        switchView('dashboard');
        updateUI();
    });

    // Search
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (term.length > 2) {
            const found = findStudent(students, term);
            if (found) {
                // Focus or highlight search behavior
                console.log('Found:', found.name);
            }
        }
        // Actually we might want search to filter the current view
        // For simplicity, search will trigger filter in students view
        if (currentView === 'students') renderStudentList();
    });

    // Filters
    document.getElementById('gradeFilter').addEventListener('change', renderStudentList);
    document.getElementById('sortControl').addEventListener('change', renderStudentList);

    // Dynamic deletions
    studentCardsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');
            students = students.filter(s => s.id !== id);
            storage.save('gm_students', students);
            updateUI();
        }
    });

    // Time display
    setInterval(() => {
        document.getElementById('currentTime').textContent = new Date().toLocaleTimeString();
    }, 1000);

    // CSV Download
    document.getElementById('downloadReport').addEventListener('click', () => {
        const headers = ['ID', 'Name', 'Value 1', 'Value 2', 'Value 3', 'Value 4', 'Average', 'Level'];
        const csvData = students.map(s => {
            const avg = calculateAverage(s.grades);
            const letter = getLetterGrade(avg);
            return [
                s.id,
                s.name,
                s.grades.value1,
                s.grades.value2,
                s.grades.value3,
                s.grades.value4,
                avg,
                letter
            ].join(',');
        });
        
        const csvContent = [headers.join(','), ...csvData].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'data_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification("Data exported to CSV.");
    });
};

const switchView = (viewName) => {
    currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.toggle('active', nav.getAttribute('data-view') === viewName);
    });
};

const showNotification = (msg) => {
    const container = document.getElementById('notificationContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: var(--sidebar-bg); color: white;
        padding: 1rem 2rem; border-radius: var(--radius-md);
        box-shadow: var(--shadow); z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Start the app
init();
