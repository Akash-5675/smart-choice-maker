function formatScore(value) {
  return Number(value).toFixed(2)
}

function buildDecisionReport({ decision, criteria, options, ratings, user }) {
  const ratingMap = new Map(
    ratings.map((rating) => [
      `${String(rating.criteriaId)}:${String(rating.optionId)}`,
      Number(rating.value) || 0
    ])
  )

  const scoreRows = options
    .map((option) => {
      const breakdown = criteria.map((criterion) => {
        const ratingValue =
          ratingMap.get(`${criterion._id.toString()}:${option._id.toString()}`) || 0
        const contribution = ratingValue * criterion.weight

        return {
          criteriaName: criterion.name,
          weight: criterion.weight,
          rating: ratingValue,
          contribution
        }
      })

      const total = breakdown.reduce(
        (sum, entry) => sum + entry.contribution,
        0
      )

      return {
        id: option._id.toString(),
        name: option.name,
        total,
        breakdown
      }
    })
    .sort((first, second) => second.total - first.total)

  const winner = scoreRows[0] || null
  const runnerUp = scoreRows[1] || null
  const totalPossibleScore = criteria.reduce((sum, criterion) => {
    return sum + criterion.weight * 10
  }, 0)
  const totalCells = criteria.length * options.length
  const completedCells = ratings.filter((rating) => Number(rating.value) > 0).length
  const completionRate = totalCells > 0 ? (completedCells / totalCells) * 100 : 0
  const topCriterion = [...criteria].sort((a, b) => b.weight - a.weight)[0] || null

  const winnerTopDrivers = winner
    ? [...winner.breakdown]
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3)
    : []

  const insights = []

  if (winner && runnerUp) {
    insights.push(
      `${winner.name} finished ahead of ${runnerUp.name} by ${formatScore(
        winner.total - runnerUp.total
      )} points.`
    )
  }

  if (winner && topCriterion) {
    const weightedEntry = winner.breakdown.find(
      (entry) => entry.criteriaName === topCriterion.name
    )

    insights.push(
      `The heaviest-weighted criterion was ${topCriterion.name} (${topCriterion.weight}), and ${winner.name} scored ${weightedEntry?.rating || 0} on it.`
    )
  }

  if (winnerTopDrivers.length > 0) {
    insights.push(
      `${winner.name}'s biggest score drivers were ${winnerTopDrivers
        .map(
          (entry) =>
            `${entry.criteriaName} (${entry.rating} x ${entry.weight} = ${formatScore(
              entry.contribution
            )})`
        )
        .join(", ")}.`
    )
  }

  insights.push(
    `The matrix is ${formatScore(completionRate)}% complete across ${criteria.length} criteria and ${options.length} options.`
  )

  const narrative = winner
    ? [
        `This report was generated for ${user.name} to explain how Smart Choice Maker reached a final recommendation for "${decision.title}".`,
        `The comparison used a weighted scoring method: each option was rated from 1 to 10 for every criterion, and each rating was multiplied by that criterion's weight before totals were added.`,
        `${winner.name} ranked first with ${formatScore(winner.total)} points${runnerUp ? `, ahead of ${runnerUp.name} at ${formatScore(runnerUp.total)}.` : "."}`,
        `Based on the entered scores, the recommendation favors ${winner.name} because it performed especially well on the most influential criteria and produced the strongest weighted total overall.`
      ]
    : [
        `This report was generated for ${user.name} for the decision "${decision.title}".`,
        "A final recommendation is not available yet because the decision matrix still needs criteria, options, and ratings."
      ]

  return {
    generatedAt: new Date().toISOString(),
    decision: {
      id: decision._id.toString(),
      title: decision.title,
      description: decision.description || ""
    },
    facts: {
      criteriaCount: criteria.length,
      optionsCount: options.length,
      ratingsCompleted: completedCells,
      ratingSlots: totalCells,
      completionRate: Number(formatScore(completionRate)),
      highestWeightedCriterion: topCriterion
        ? {
            name: topCriterion.name,
            weight: topCriterion.weight
          }
        : null,
      totalPossibleScore: Number(formatScore(totalPossibleScore))
    },
    recommendation: winner
      ? {
          optionName: winner.name,
          totalScore: Number(formatScore(winner.total)),
          marginOverRunnerUp: runnerUp
            ? Number(formatScore(winner.total - runnerUp.total))
            : null,
          confidenceSummary: insights[0] || ""
        }
      : null,
    methodology: "Weighted scoring: total score = sum of criterion weight multiplied by option rating.",
    narrative,
    insights,
    scoreRows: scoreRows.map((row) => ({
      ...row,
      total: Number(formatScore(row.total)),
      breakdown: row.breakdown.map((entry) => ({
        ...entry,
        contribution: Number(formatScore(entry.contribution))
      }))
    }))
  }
}

function wrapText(text, maxLength) {
  const words = text.split(/\s+/)
  const lines = []
  let currentLine = ""

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    } else {
      currentLine = nextLine
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function buildPdfBuffer(report) {
  const lines = [
    "Smart Choice Maker Report",
    "",
    `Decision: ${report.decision.title}`,
    report.decision.description
      ? `Description: ${report.decision.description}`
      : "Description: Not provided",
    `Generated: ${new Date(report.generatedAt).toLocaleString("en-IN")}`,
    "",
    "Summary"
  ]

  report.narrative.forEach((paragraph) => {
    lines.push(...wrapText(paragraph, 92), "")
  })

  lines.push("Facts")
  lines.push(`Criteria count: ${report.facts.criteriaCount}`)
  lines.push(`Options count: ${report.facts.optionsCount}`)
  lines.push(
    `Completed ratings: ${report.facts.ratingsCompleted}/${report.facts.ratingSlots}`
  )
  lines.push(`Completion rate: ${report.facts.completionRate}%`)
  if (report.facts.highestWeightedCriterion) {
    lines.push(
      `Highest weighted criterion: ${report.facts.highestWeightedCriterion.name} (${report.facts.highestWeightedCriterion.weight})`
    )
  }
  if (report.recommendation) {
    lines.push(
      `Recommended option: ${report.recommendation.optionName} (${report.recommendation.totalScore})`
    )
  }

  lines.push("", "Option Breakdown")

  report.scoreRows.forEach((row) => {
    lines.push(`${row.name}: total ${row.total}`)
    row.breakdown.forEach((entry) => {
      lines.push(
        `- ${entry.criteriaName}: ${entry.rating} x ${entry.weight} = ${entry.contribution}`
      )
    })
    lines.push("")
  })

  lines.push("Insights")
  report.insights.forEach((insight) => {
    lines.push(...wrapText(`- ${insight}`, 92))
  })

  const linesPerPage = 38
  const pages = []
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage))
  }

  const objects = []

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj")

  const pageObjectNumbers = pages.map((_, index) => 3 + index * 2)
  const contentObjectNumbers = pages.map((_, index) => 4 + index * 2)

  objects.push(
    `2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectNumbers
      .map((number) => `${number} 0 R`)
      .join(" ")}] >>\nendobj`
  )

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = pageObjectNumbers[pageIndex]
    const contentObjectNumber = contentObjectNumbers[pageIndex]

    objects.push(
      `${pageObjectNumber} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectNumber} 0 R >>\nendobj`
    )

    const contentLines = ["BT", "/F1 11 Tf", "50 742 Td", "14 TL"]

    pageLines.forEach((line, lineIndex) => {
      if (lineIndex === 0) {
        contentLines.push(`(${escapePdfText(line)}) Tj`)
      } else {
        contentLines.push("T*")
        contentLines.push(`(${escapePdfText(line)}) Tj`)
      }
    })

    contentLines.push("ET")

    const stream = contentLines.join("\n")
    const length = Buffer.byteLength(stream, "utf8")

    objects.push(
      `${contentObjectNumber} 0 obj\n<< /Length ${length} >>\nstream\n${stream}\nendstream\nendobj`
    )
  })

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"))
    pdf += `${object}\n`
  })

  const xrefOffset = Buffer.byteLength(pdf, "utf8")
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, "utf8")
}

module.exports = {
  buildDecisionReport,
  buildPdfBuffer
}
