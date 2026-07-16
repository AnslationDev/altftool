import React from 'react';
import { Settings } from 'lucide-react';

const Calculator = ({ weight, reps, formula, setWeight, setReps, setFormula, onCalculate }) => {
    const formulas = [
        { id: 'brzycki', name: 'Brzycki', description: 'Popular formula for strength training' },
        { id: 'lander', name: 'Lander', description: 'Used for powerlifting' },
        { id: 'lombardi', name: 'Lombardi', description: 'Simple exponential formula' },
        { id: 'mayhew', name: 'Mayhew', description: 'Better for higher reps' },
        { id: 'oconner', name: 'O\'Conner', description: 'Linear approximation' },
        { id: 'wathan', name: 'Wathan', description: 'Accurate for moderate reps' },
        { id: 'adams', name: 'Adams', description: 'Advanced formula' },
    ];

    return (
        <div className="orm-card">
            <div className="orm-card-title">
                <Settings size={20} />
                Calculation Setup
            </div>

            <div className="orm-form-group">
                <label className="orm-label">
                    <span className="orm-label-text">Exercise</span>
                </label>
                <input
                    type="text"
                    placeholder="e.g., Bench Press, Deadlift, Squat"
                    className="orm-input"
                    style={{ marginBottom: '12px' }}
                />
            </div>

            <div className="orm-form-group">
                <label className="orm-label">
                    <span className="orm-label-text">Current Weight</span>
                    <span className="orm-label-value">{weight} kg</span>
                </label>
                <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    placeholder="Weight in kg"
                    className="orm-input"
                />
            </div>

            <div className="orm-form-group">
                <label className="orm-label">
                    <span className="orm-label-text">Reps You Can Do</span>
                    <span className="orm-label-value">{reps} reps</span>
                </label>
                <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                    min="1"
                    max="50"
                    placeholder="Number of reps"
                    className="orm-input"
                />
            </div>

            <div className="orm-form-group">
                <label className="orm-label">
                    <span className="orm-label-text">Formula</span>
                </label>
                <select
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    className="orm-select"
                >
                    {formulas.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name} - {f.description}
                        </option>
                    ))}
                </select>
            </div>

            <div className="orm-formula-info">
                {formulas.find((f) => f.id === formula)?.description}
            </div>

            <button
                onClick={onCalculate}
                className="orm-btn orm-btn-primary"
                style={{
                    width: '100%',
                    marginTop: '16px',
                    justifyContent: 'center',
                }}
            >
                Calculate 1RM
            </button>
        </div>
    );
};

export default Calculator;
