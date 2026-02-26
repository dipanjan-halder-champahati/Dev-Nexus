import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";
import { sessionApi } from "../api/sessions";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(
    PROBLEMS[currentProblemId].starterCode.javascript,
  );
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const currentProblem = PROBLEMS[currentProblemId];

  useEffect(() => {
    if (id && PROBLEMS[id]) {
      setCurrentProblemId(id);
      setCode(PROBLEMS[id].starterCode[selectedLanguage]);
      setOutput(null);
    }
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) =>
    navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 } });
  };

  const normalizeOutput = (output) =>
    output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ","),
      )
      .filter((line) => line.length > 0)
      .join("\n");

  const checkIfTestsPassed = (actualOutput, expectedOutput) =>
    normalizeOutput(actualOutput) == normalizeOutput(expectedOutput);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setIsRunning(false);

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      if (checkIfTestsPassed(result.output, expectedOutput)) {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      } else {
        result.success = false;
        result.error = "Tests failed. Your output doesn't match the expected output.";
        toast.error("Tests failed. Check your output!");
      }
    } else {
      toast.error("Code execution failed!");
    }

    setOutput(result);
  };

  const handleReviewCode = useCallback(async () => {
    if (isReviewing) return;
    setIsReviewing(true);
    try {
      const result = await sessionApi.reviewWithAI(code, selectedLanguage);
      setAiReview(result);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "AI review failed. Please try again.",
      );
    } finally {
      setIsReviewing(false);
    }
  }, [code, selectedLanguage, isReviewing]);

  return (
    <>
      <style>{`
        .problem-page-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0d0e14;
        }

        /* ── Panel resize handles ── */
        .resize-col {
          width: 4px;
          background: rgba(255,255,255,.05);
          cursor: col-resize;
          transition: background .15s;
          position: relative;
        }
        .resize-col:hover, .resize-col:active {
          background: rgba(108,79,246,.6);
        }
        .resize-col::before {
          content: "";
          position: absolute;
          inset: -4px 0;
        }

        .resize-row {
          height: 4px;
          background: rgba(255,255,255,.05);
          cursor: row-resize;
          transition: background .15s;
          position: relative;
        }
        .resize-row:hover, .resize-row:active {
          background: rgba(108,79,246,.6);
        }
        .resize-row::before {
          content: "";
          position: absolute;
          inset: 0 -4px;
        }
      `}</style>

      <div className="problem-page-root">
        <Navbar />

        <div style={{ flex: 1, overflow: "hidden" }}>
          <PanelGroup direction="horizontal">
            {/* Left: problem description */}
            <Panel defaultSize={40} minSize={28}>
              <ProblemDescription
                problem={currentProblem}
                currentProblemId={currentProblemId}
                onProblemChange={handleProblemChange}
                allProblems={Object.values(PROBLEMS)}
              />
            </Panel>

            <PanelResizeHandle className="resize-col" />

            {/* Right: editor + output */}
            <Panel defaultSize={60} minSize={30}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={70} minSize={30}>
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    isReviewing={isReviewing}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={setCode}
                    onRunCode={handleRunCode}
                    onReviewCode={handleReviewCode}
                    problem={currentProblem}
                  />
                </Panel>

                <PanelResizeHandle className="resize-row" />

                <Panel defaultSize={30} minSize={20}>
                  <OutputPanel output={output} aiReview={aiReview} />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  );
}

export default ProblemPage;
