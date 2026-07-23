"use client";

import React from 'react';
import { History, Trash2 } from 'lucide-react';

const CalculationHistory = ({ history, onClear }) => {
    return (
        <div className="orm-card">
            <div className="orm-card-title">
                <History size={20} />
                Calculation History
            </div>

            {history.length === 0 ? (
                <div className="orm-empty-state" style={{ padding: '20px' }}>
                    <p className="orm-empty-text">No history yet. Make your first calculation!</p>
                </div>
            ) : (
                <>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {history.map((item, idx) => (
                            <div key={idx} className="orm-history-item">
                                <div className="orm-history-info">
                                    <div className="orm-history-exercise">{item.exercise || 'Exercise'}</div>
                                    <div className="orm-history-details">
                                        {item.weight} kg × {item.reps} reps
                                    </div>
                                </div>
                                <div className="orm-history-result">{item.oneRepMax.toFixed(1)}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClear}
                        className="orm-btn orm-btn-secondary"
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            justifyContent: 'center',
                            color: 'var(--orm-danger)',
                            borderColor: 'var(--orm-danger)',
                        }}
                    >
                        <Trash2 size={16} />
                        Clear History
                    </button>
                </>
            )}
        </div>
    );
};

export default CalculationHistory;
