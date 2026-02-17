/**
 * Utility functions for Data Management
 * Showcases: ES6 features, Arrow functions, Array methods, Destructuring
 */

// 1. Arrow Function for Average Calculation (using reduce)
// Showcases: Arrow function, reduce()
export const calculateAverage = (grades) => {
    const values = Object.values(grades);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return (sum / values.length).toFixed(1);
};

// 2. Arrow Function for Grade Mapping
// Showcases: Template literals, Arrow function
export const getLetterGrade = (avg) => {
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B';
    if (avg >= 70) return 'C';
    if (avg >= 60) return 'D';
    return 'F';
};

// 3. Higher-Order Function that accepts a calculation strategy
// Showcases: Higher-order function
export const processStudentData = (students, strategy) => {
    return students.map(student => strategy(student));
};

// 4. Formatter using Template Literals
// Showcases: Template literals, destructuring
export const formatStudentReport = ({ name, id, grades }) => {
    const avg = calculateAverage(grades);
    const grade = getLetterGrade(avg);
    return `
        <div class="report-card">
            <h4>${name} (${id})</h4>
            <p>Level: <strong>${grade}</strong></p>
            <p>Total: ${avg}%</p>
        </div>
    `;
};

// 5. Filtering students by grade range
// Showcases: filter(), Arrow function
export const filterByGrade = (students, targetGrade) => {
    if (targetGrade === 'all') return [...students]; // Spread operator for copying
    return students.filter(student => {
        const avg = calculateAverage(student.grades);
        return getLetterGrade(avg) === targetGrade;
    });
};

// 6. Searching student by name
// Showcases: find(), Arrow function
export const findStudent = (students, searchTerm) => {
    return students.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
};

// 7. Simulating Data Persistence (Local Storage)
// Showcases: JSON stringify/parse
export const storage = {
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem(key)) || null
};

// 8. Promise implementation for simulated data loading
// Showcases: Promises
export const simulateAsyncLoad = (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, 800);
    });
};
