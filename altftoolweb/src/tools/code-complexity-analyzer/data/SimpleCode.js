export const SAMPLE_SIMPLE = `// Simple Calculator
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

function calculate(operation, a, b) {
  switch (operation) {
    case 'add':
      return add(a, b);
    case 'subtract':
      return subtract(a, b);
    case 'multiply':
      return multiply(a, b);
    case 'divide':
      return divide(a, b);
    default:
      throw new Error("Unknown operation");
  }
}

const result = calculate('add', 5, 3);
console.log(result);`;

export const SAMPLE_COMPLEX = `// Complex Data Processor with Multiple Issues
function processUserData(users, config, filters, options, extraParams) {
  const results = [];
  let errorCount = 0;
  let processedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.active === true) {
      if (user.age >= 18) {
        if (user.email && user.email.includes('@')) {
          if (filters.country) {
            if (user.country === filters.country) {
              if (config.validatePhone) {
                if (user.phone && user.phone.length >= 10) {
                  // Process valid user
                  const processed = {
                    id: user.id,
                    name: user.firstName + ' ' + user.lastName,
                    email: user.email.toLowerCase(),
                    age: user.age,
                    score: 0
                  };

                  // Calculate score
                  if (user.purchases > 100) {
                    processed.score = 10;
                  } else if (user.purchases > 50) {
                    processed.score = 7;
                  } else if (user.purchases > 20) {
                    processed.score = 5;
                  } else if (user.purchases > 10) {
                    processed.score = 3;
                  } else {
                    processed.score = 1;
                  }

                  // Apply multiplier
                  for (let j = 0; j < options.multipliers.length; j++) {
                    if (options.multipliers[j].category === user.category) {
                      processed.score *= options.multipliers[j].value;
                      break;
                    }
                  }

                  results.push(processed);
                  processedCount++;
                } else {
                  errorCount++;
                }
              } else {
                results.push({
                  id: user.id,
                  name: user.firstName + ' ' + user.lastName,
                  email: user.email
                });
                processedCount++;
              }
            } else {
              skippedCount++;
            }
          } else {
            results.push({
              id: user.id,
              name: user.firstName + ' ' + user.lastName,
              email: user.email
            });
            processedCount++;
          }
        } else {
          errorCount++;
        }
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  // Generate report
  const report = {
    total: users.length,
    processed: processedCount,
    skipped: skippedCount,
    errors: errorCount,
    successRate: (processedCount / users.length) * 100
  };

  if (config.logging) {
    console.log("Processing complete:", report);
  }

  return { results, report };
}

function validateInput(data) {
  if (!data) return false;
  if (!data.name) return false;
  if (!data.email) return false;
  if (data.name.length < 2) return false;
  if (data.name.length > 100) return false;
  if (!data.email.includes('@')) return false;
  if (data.age && data.age < 0) return false;
  if (data.age && data.age > 150) return false;
  return true;
}

function handleResponse(response, callback) {
  if (response.status === 200) {
    callback(null, response.data);
  } else if (response.status === 404) {
    callback(new Error("Not found"), null);
  } else if (response.status === 500) {
    callback(new Error("Server error"), null);
  } else if (response.status === 403) {
    callback(new Error("Forbidden"), null);
  } else if (response.status === 401) {
    callback(new Error("Unauthorized"), null);
  } else {
    callback(new Error("Unknown error: " + response.status), null);
  }
}

function sortData(data, sortBy, direction) {
  switch (sortBy) {
    case 'name':
      return data.sort((a, b) => direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name));
    case 'age':
      return data.sort((a, b) => direction === 'asc'
        ? a.age - b.age
        : b.age - a.age);
    case 'score':
      return data.sort((a, b) => direction === 'asc'
        ? a.score - b.score
        : b.score - a.score);
    case 'date':
      return data.sort((a, b) => direction === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date));
    case 'email':
      return data.sort((a, b) => direction === 'asc'
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email));
    default:
      return data;
  }
}`;

export const SAMPLES = [
    { id: 'simple', name: 'Simple Calculator', code: SAMPLE_SIMPLE },
    { id: 'complex', name: 'Complex Processor', code: SAMPLE_COMPLEX },
];
