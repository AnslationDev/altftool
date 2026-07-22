import React, { useState } from "react";
import {
    Container,
    Grid,
    Box,
    Typography,
    CircularProgress,
    Alert,
    AlertTitle
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Use relative paths instead of absolute paths
import JDInput from "../components/JDInput";
import ScoreCard from "../components/ScoreCard";
import ExtractionResults from "../components/ExtractionResults";

import SuggestionsPanel from "../components/SuggestionsPanel";
import RewrittenJD from "../components/RewrittenJD";
import { analyzeJobDescription } from "../services/aiService";

const AnalyzerPage = () => {
    const theme = useTheme();

    const [jobDescription, setJobDescription] = useState("");
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async (jdText) => {
        setLoading(true);
        setError(null);
        setJobDescription(jdText);

        try {
            const result = await analyzeJobDescription(jdText);
            setAnalysisData(result);
        } catch (err) {
            setError(err.message || "Analysis failed.");
            setAnalysisData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setJobDescription("");
        setAnalysisData(null);
        setError(null);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Container
                maxWidth="xl"
                sx={{
                    mt: 5,
                    mb: 5,

                    maxWidth: "1400px !important",
                }}
            >

                {/* MAIN GRID -  */}
                <Grid
                    spacing={4}
                    justifyContent="center"
                    alignItems="flex-start"
                >
                    <Grid item xs={12} md={4} lg={3} sx={{ mb: 5 }}>
                        <JDInput
                            onAnalyze={handleAnalyze}
                            onReset={handleReset}
                            loading={loading}
                        />
                    </Grid>

                    {/* RIGHT ANALYZER SECTION */}
                    <Grid
                        item
                        xs={12}
                        md={8}
                        lg={9}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                        }}
                    >
                        {/* Loading */}
                        {loading && (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                minHeight="400px"
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                                    border: `1px dashed ${theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400]}`,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                <CircularProgress size={60} />
                                <Typography variant="h6" sx={{ mt: 2 }} color="text.primary">
                                    Analyzing your Job Description...
                                </Typography>
                            </Box>
                        )}

                        {/* Error */}
                        {error && (
                            <Alert severity="error" variant="filled" sx={{ p: 3 }}>
                                <AlertTitle>Error</AlertTitle>
                                {error}
                            </Alert>
                        )}

                        {/* RESULTS */}
                        {analysisData && !loading && (
                            <>
                                {/* ScoreCard */}
                                <ScoreCard scores={analysisData.scores} />

                                {/* Extractions + Flags */}
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <ExtractionResults data={analysisData.extracted} />
                                    </Grid>
                                </Grid>

                                {/* Rewritten + Suggestions */}
                                <RewrittenJD
                                    original={jobDescription}
                                    rewritten={analysisData.rewrittenJD}
                                />

                                <SuggestionsPanel suggestions={analysisData.suggestions} />
                            </>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AnalyzerPage;
