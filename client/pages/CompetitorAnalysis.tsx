import { useState, useMemo } from 'react';
import { Star, TrendingUp, MessageSquare, Reply, Download, Plus, ExternalLink, ArrowUpRight, ArrowDownRight, Minus, ChevronDown, Loader2, Sparkles } from 'lucide-react';

// =============================================
// TYPE DEFINITIONS
// =============================================

interface Review {
  author?: string;
  rating: number;
  date: string;
  review_text?: string;
  response_by_owner?: "yes" | "no";
}

interface BusinessData {
  place_name: string;
  place_id: string;
  reviews: Review[];
}

interface AIRecommendations {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  actionPlan: {
    days30: string[];
    days60: string[];
    days90: string[];
  };
}

// =============================================
// DUMMY DATA
// =============================================

const yourClientData: BusinessData = {
  place_name: "Your Business",
  place_id: "your-business-001",
  reviews: [
    { author: "John Smith", rating: 5, date: "1 day ago", review_text: "Excellent service! Highly recommend.", response_by_owner: "yes" },
    { author: "Sarah Johnson", rating: 5, date: "3 days ago", review_text: "Professional and efficient.", response_by_owner: "yes" },
    { author: "Mike Davis", rating: 4, date: "5 days ago", review_text: "Good experience overall.", response_by_owner: "yes" },
    { author: "Emily Chen", rating: 5, date: "a week ago", review_text: "Amazing team!", response_by_owner: "yes" },
    { author: "Robert Lee", rating: 3, date: "2 weeks ago", review_text: "Decent but could improve.", response_by_owner: "no" },
    { author: "Linda Martinez", rating: 5, date: "3 weeks ago", review_text: "Best service in town!", response_by_owner: "yes" },
    { author: "David Wilson", rating: 4, date: "a month ago", review_text: "Very satisfied.", response_by_owner: "yes" },
    { author: "Jennifer Taylor", rating: 5, date: "a month ago", review_text: "Outstanding quality!", response_by_owner: "yes" },
    { author: "James Anderson", rating: 5, date: "2 months ago", review_text: "Exceeded expectations.", response_by_owner: "yes" },
    { author: "Patricia Thomas", rating: 4, date: "2 months ago", review_text: "Great job!", response_by_owner: "no" },
    { author: "Michael Brown", rating: 5, date: "3 months ago", review_text: "Highly professional.", response_by_owner: "yes" },
    { author: "Mary Garcia", rating: 5, date: "4 months ago", review_text: "Wonderful experience.", response_by_owner: "yes" },
  ]
};

const competitors: BusinessData[] = [
  {
    place_name: "Competitor A",
    place_id: "competitor-a-001",
    reviews: [
      { author: "Alex Thompson", rating: 5, date: "2 days ago", review_text: "Great service!", response_by_owner: "yes" },
      { author: "Rachel Green", rating: 4, date: "4 days ago", review_text: "Pretty good experience.", response_by_owner: "no" },
      { author: "Chris Evans", rating: 5, date: "a week ago", review_text: "Excellent work!", response_by_owner: "yes" },
      { author: "Monica Geller", rating: 3, date: "2 weeks ago", review_text: "Average service.", response_by_owner: "no" },
      { author: "Joey Tribbiani", rating: 4, date: "3 weeks ago", review_text: "Good overall.", response_by_owner: "yes" },
      { author: "Phoebe Buffay", rating: 5, date: "a month ago", review_text: "Amazing!", response_by_owner: "yes" },
      { author: "Ross Geller", rating: 4, date: "a month ago", review_text: "Satisfied.", response_by_owner: "no" },
      { author: "Chandler Bing", rating: 5, date: "2 months ago", review_text: "Top notch!", response_by_owner: "yes" },
      { author: "Emma Watson", rating: 3, date: "3 months ago", review_text: "Could be better.", response_by_owner: "no" },
      { author: "Daniel Radcliffe", rating: 4, date: "4 months ago", review_text: "Good job.", response_by_owner: "yes" },
    ]
  },
  {
    place_name: "Competitor B",
    place_id: "competitor-b-002",
    reviews: [
      { author: "Tony Stark", rating: 5, date: "1 day ago", review_text: "Incredible service!", response_by_owner: "yes" },
      { author: "Steve Rogers", rating: 5, date: "3 days ago", review_text: "Professional team.", response_by_owner: "yes" },
      { author: "Natasha Romanoff", rating: 4, date: "5 days ago", review_text: "Very good.", response_by_owner: "yes" },
      { author: "Bruce Banner", rating: 2, date: "a week ago", review_text: "Not satisfied.", response_by_owner: "no" },
      { author: "Thor Odinson", rating: 5, date: "2 weeks ago", review_text: "Worthy service!", response_by_owner: "yes" },
      { author: "Clint Barton", rating: 4, date: "3 weeks ago", review_text: "Hit the mark.", response_by_owner: "no" },
      { author: "Wanda Maximoff", rating: 5, date: "a month ago", review_text: "Magical experience.", response_by_owner: "yes" },
      { author: "Vision", rating: 5, date: "2 months ago", review_text: "Perfectly executed.", response_by_owner: "yes" },
      { author: "Peter Parker", rating: 4, date: "3 months ago", review_text: "Web-slingin' good!", response_by_owner: "yes" },
      { author: "Stephen Strange", rating: 3, date: "4 months ago", review_text: "Seen better.", response_by_owner: "no" },
    ]
  },
  {
    place_name: "Competitor C",
    place_id: "competitor-c-003",
    reviews: [
      { author: "Luke Skywalker", rating: 5, date: "2 days ago", review_text: "The Force is strong!", response_by_owner: "yes" },
      { author: "Leia Organa", rating: 4, date: "4 days ago", review_text: "You're my only hope.", response_by_owner: "yes" },
      { author: "Han Solo", rating: 5, date: "a week ago", review_text: "Never tell me the odds!", response_by_owner: "no" },
      { author: "Chewbacca", rating: 5, date: "2 weeks ago", review_text: "RRWWWGG!", response_by_owner: "yes" },
      { author: "Obi-Wan Kenobi", rating: 4, date: "3 weeks ago", review_text: "This is the service you're looking for.", response_by_owner: "yes" },
      { author: "Yoda", rating: 5, date: "a month ago", review_text: "Do or do not. They do!", response_by_owner: "yes" },
      { author: "Darth Vader", rating: 3, date: "2 months ago", review_text: "I find lack of speed disturbing.", response_by_owner: "no" },
      { author: "Rey", rating: 5, date: "3 months ago", review_text: "The belonging you seek is here.", response_by_owner: "yes" },
      { author: "Finn", rating: 4, date: "4 months ago", review_text: "Rebel good!", response_by_owner: "yes" },
      { author: "Kylo Ren", rating: 2, date: "5 months ago", review_text: "Show me the power.", response_by_owner: "no" },
    ]
  },
  {
    place_name: "Competitor D",
    place_id: "competitor-d-004",
    reviews: [
      { author: "Harry Potter", rating: 5, date: "1 day ago", review_text: "Brilliant! Expecto Patronum level!", response_by_owner: "yes" },
      { author: "Hermione Granger", rating: 5, date: "3 days ago", review_text: "Textbook perfect execution.", response_by_owner: "yes" },
      { author: "Ron Weasley", rating: 4, date: "5 days ago", review_text: "Bloody brilliant!", response_by_owner: "no" },
      { author: "Albus Dumbledore", rating: 5, date: "a week ago", review_text: "Happiness found here!", response_by_owner: "yes" },
      { author: "Severus Snape", rating: 3, date: "2 weeks ago", review_text: "Acceptable... barely.", response_by_owner: "no" },
      { author: "Minerva McGonagall", rating: 5, date: "3 weeks ago", review_text: "5 points!", response_by_owner: "yes" },
      { author: "Sirius Black", rating: 4, date: "a month ago", review_text: "Mischief managed!", response_by_owner: "yes" },
      { author: "Rubeus Hagrid", rating: 5, date: "2 months ago", review_text: "Yer a wizard with service!", response_by_owner: "yes" },
      { author: "Luna Lovegood", rating: 4, date: "3 months ago", review_text: "Extraordinary!", response_by_owner: "no" },
      { author: "Draco Malfoy", rating: 2, date: "4 months ago", review_text: "My father will hear about this.", response_by_owner: "no" },
    ]
  }
];

// =============================================
// ANALYTICS FUNCTIONS
// =============================================

function calculateAnalytics(reviews: Review[]) {
  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const responseRate = total > 0 ? (reviews.filter(r => r.response_by_owner === 'yes').length / total) * 100 : 0;

  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => ratingDist[r.rating]++);

  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const negativeCount = reviews.filter(r => r.rating <= 2).length;

  return {
    totalReviews: total,
    avgRating: avgRating.toFixed(1),
    responseRate: Math.round(responseRate),
    positivePercentage: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
    negativePercentage: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
    ratingDistribution: Object.entries(ratingDist).reverse().map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })),
    highestRatingCount: ratingDist[5],
    lowestRatingCount: ratingDist[1] + ratingDist[2]
  };
}

// =============================================
// PREPARE DATA FOR AI API
// =============================================

function prepareAIAnalyticsData(
  yourBusiness: BusinessData,
  competitors: BusinessData[],
  selectedCompetitor: BusinessData,
  timeRangeMonths: number
) {
  const yourAnalytics = calculateAnalytics(yourBusiness.reviews);
  const competitorAnalytics = calculateAnalytics(selectedCompetitor.reviews);
  const allCompetitorsReviews = competitors.flatMap(c => c.reviews);
  const allCompetitorsAnalytics = calculateAnalytics(allCompetitorsReviews);

  return {
    businessName: yourBusiness.place_name,
    analysisDate: new Date().toISOString(),
    timeRangeMonths,
    yourPerformance: {
      totalReviews: yourAnalytics.totalReviews,
      averageRating: parseFloat(yourAnalytics.avgRating),
      responseRate: yourAnalytics.responseRate,
      positivePercentage: yourAnalytics.positivePercentage,
      negativePercentage: yourAnalytics.negativePercentage,
      ratingBreakdown: {
        fiveStars: yourAnalytics.ratingDistribution[0].count,
        fourStars: yourAnalytics.ratingDistribution[1].count,
        threeStars: yourAnalytics.ratingDistribution[2].count,
        twoStars: yourAnalytics.ratingDistribution[3].count,
        oneStars: yourAnalytics.ratingDistribution[4].count,
      }
    },
    competitiveData: {
      selectedCompetitor: {
        name: selectedCompetitor.place_name,
        totalReviews: competitorAnalytics.totalReviews,
        averageRating: parseFloat(competitorAnalytics.avgRating),
        responseRate: competitorAnalytics.responseRate,
      },
      allCompetitors: {
        averageTotalReviews: Math.round(allCompetitorsAnalytics.totalReviews / competitors.length),
        averageRating: parseFloat(allCompetitorsAnalytics.avgRating),
        averageResponseRate: allCompetitorsAnalytics.responseRate,
      }
    },
    gaps: {
      reviewVolumeDifference: yourAnalytics.totalReviews - competitorAnalytics.totalReviews,
      ratingDifference: parseFloat((parseFloat(yourAnalytics.avgRating) - parseFloat(competitorAnalytics.avgRating)).toFixed(2)),
      responseRateDifference: yourAnalytics.responseRate - competitorAnalytics.responseRate,
    }
  };
}

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================

function CompetitorDashboard() {
  const [selectedCompetitor, setSelectedCompetitor] = useState(competitors[0]);
  const [timeRange, setTimeRange] = useState(6);
  const [chartMode, setChartMode] = useState('single');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{
    month: string;
    value: number;
    x: number;
    y: number;
    label?: string;
  } | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Add Competitor Dialog State
  const [showAddCompetitorDialog, setShowAddCompetitorDialog] = useState(false);
  const [newPlaceId, setNewPlaceId] = useState('');
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [addCompetitorError, setAddCompetitorError] = useState('');

  // Combine all businesses for selection
  const allBusinesses = [yourClientData, ...competitors];
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData>(competitors[0]);

  const yourAnalytics = useMemo(() => calculateAnalytics(yourClientData.reviews), []);
  const selectedAnalytics = useMemo(() => calculateAnalytics(selectedBusiness.reviews), [selectedBusiness]);
  const allCompetitorsAnalytics = useMemo(() => {
    const allReviews = competitors.flatMap(c => c.reviews);
    return calculateAnalytics(allReviews);
  }, []);

  const getComparisonIcon = (yourVal: number, compVal: number, inverse = false) => {
    if (Math.abs(yourVal - compVal) < 0.1) return <Minus className="w-4 h-4 text-gray-400" />;
    const isWinning = inverse ? yourVal < compVal : yourVal > compVal;
    return isWinning ?
      <ArrowUpRight className="w-4 h-4 text-green-600" /> :
      <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const latestReviews = selectedBusiness.reviews.slice(0, 5);

  // =============================================
  // ADD COMPETITOR FUNCTION
  // =============================================

  const handleAddCompetitor = async () => {
    // Validate Place ID
    if (!newPlaceId.trim()) {
      setAddCompetitorError('Please enter a Place ID');
      return;
    }

    setIsAddingCompetitor(true);
    setAddCompetitorError('');

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT/fetch-competitor-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify({
          place_id: newPlaceId.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch competitor data');
      }

      const competitorData = await response.json();

      // Validate response data structure
      if (!competitorData.place_name || !competitorData.reviews) {
        throw new Error('Invalid data format received from API');
      }

      // Check if competitor already exists
      const existingCompetitor = competitors.find(c => c.place_id === competitorData.place_id);
      if (existingCompetitor) {
        setAddCompetitorError('This competitor is already added');
        return;
      }

      // Add new competitor to the list
      competitors.push(competitorData);

      // Select the newly added competitor
      setSelectedBusiness(competitorData);

      // Close dialog and reset
      setShowAddCompetitorDialog(false);
      setNewPlaceId('');

      alert(`✅ ${competitorData.place_name} has been added successfully!`);

    } catch (error) {
      console.error('Error adding competitor:', error);

      // Show friendly error message
      setAddCompetitorError(
        error instanceof Error
          ? error.message
          : 'Failed to add competitor. Please check the Place ID and try again.'
      );

      // For demo purposes: simulate adding a competitor
      if (error instanceof Error && error.message.includes('YOUR_API_ENDPOINT')) {
        alert(
          '⚠️ API endpoint not configured yet!\n\n' +
          'To enable this feature:\n\n' +
          '1. Set up your backend API endpoint\n' +
          '2. Update YOUR_API_ENDPOINT in handleAddCompetitor function\n' +
          '3. API should accept Place ID and return competitor data\n\n' +
          'Expected API Response:\n' +
          '{\n' +
          '  "place_name": "Business Name",\n' +
          '  "place_id": "place-id-123",\n' +
          '  "reviews": [\n' +
          '    {\n' +
          '      "author": "John Doe",\n' +
          '      "rating": 5,\n' +
          '      "date": "2 days ago",\n' +
          '      "review_text": "Great!",\n' +
          '      "response_by_owner": "yes"\n' +
          '    }\n' +
          '  ]\n' +
          '}'
        );
      }
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  // =============================================
  // AI RECOMMENDATIONS FUNCTION
  // =============================================

  const generateAIRecommendations = async () => {
    setIsLoadingAI(true);
    setShowAIPanel(true);

    try {
      // Prepare data for AI API
      const analyticsData = prepareAIAnalyticsData(
        yourClientData,
        competitors,
        selectedBusiness,
        timeRange
      );

      // TODO: Replace with your actual AI API endpoint
      // const response = await fetch('YOUR_AI_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analyticsData)
      // });
      // const aiResponse = await response.json();

      // Simulate AI API call with dummy response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const dummyAIResponse: AIRecommendations = {
        summary: `${yourClientData.place_name} shows strong performance with ${yourAnalytics.avgRating} average rating and ${yourAnalytics.responseRate}% response rate. However, there are ${yourAnalytics.totalReviews - selectedAnalytics.totalReviews} fewer reviews than ${selectedBusiness.place_name}, presenting an opportunity for growth.`,
        strengths: [
          `High response rate of ${yourAnalytics.responseRate}% demonstrates excellent customer engagement`,
          `Strong average rating of ${yourAnalytics.avgRating} stars indicates quality service delivery`,
          `${yourAnalytics.positivePercentage}% positive reviews show high customer satisfaction`
        ],
        weaknesses: [
          `Review volume is ${Math.abs(yourAnalytics.totalReviews - selectedAnalytics.totalReviews)} behind ${selectedBusiness.place_name}`,
          `${yourAnalytics.negativePercentage}% negative reviews need attention and resolution`,
          `Response time to reviews could be improved for faster engagement`
        ],
        recommendations: [
          "Implement automated review request system after each completed service",
          "Create response templates for common review types to improve response time",
          "Address recurring issues mentioned in negative reviews",
          "Incentivize satisfied customers to leave detailed reviews",
          "Monitor competitor strategies and adapt best practices",
          "Set up Google Business Profile optimization with keywords",
          "Train team on proper review response etiquette and timing"
        ],
        actionPlan: {
          days30: [
            "Set up automated email/SMS review requests",
            "Respond to all pending reviews within 48 hours",
            "Create review response templates"
          ],
          days60: [
            "Launch customer feedback survey to improve service",
            "Implement staff training on review management",
            "Optimize Google Business Profile with photos and updates"
          ],
          days90: [
            "Analyze review trends and adjust strategy",
            "Create case studies from positive reviews",
            "Implement loyalty program to encourage repeat reviews"
          ]
        }
      };

      setAiRecommendations(dummyAIResponse);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // =============================================
  // PDF DOWNLOAD FUNCTION - Using html2canvas + jsPDF
  // =============================================

  // const downloadComprehensivePDF = async () => {
  //   setIsDownloadingPDF(true);

  //   try {
  //     // Create a hidden container for the PDF content
  //     const pdfContainer = document.createElement('div');
  //     pdfContainer.style.position = 'absolute';
  //     pdfContainer.style.left = '-9999px';
  //     pdfContainer.style.width = '1200px';
  //     document.body.appendChild(pdfContainer);

  //     // Prepare comprehensive data
  //     const pdfData = {
  //       reportDate: new Date().toLocaleDateString('en-US', {
  //         year: 'numeric',
  //         month: 'long',
  //         day: 'numeric'
  //       }),
  //       timestamp: Date.now(),
  //       selectedBusiness: {
  //         name: selectedBusiness.place_name,
  //         isYourBusiness: selectedBusiness.place_id === yourClientData.place_id,
  //       },
  //       timeRange: timeRange,
  //       metrics: {
  //         totalReviews: selectedAnalytics.totalReviews,
  //         averageRating: selectedAnalytics.avgRating,
  //         responseRate: selectedAnalytics.responseRate,
  //         positivePercentage: selectedAnalytics.positivePercentage,
  //         negativePercentage: selectedAnalytics.negativePercentage,
  //       },
  //       chartData: {
  //         monthlyData: [
  //           { month: 'May', value: 1 },
  //           { month: 'Jun', value: 1 },
  //           { month: 'Jul', value: 1 },
  //           { month: 'Aug', value: 1 },
  //           { month: 'Sep', value: 5 },
  //           { month: 'Oct', value: 3 }
  //         ],
  //       },
  //       ratingDistribution: selectedAnalytics.ratingDistribution,
  //       comparisonData: allBusinesses.map(business => {
  //         const analytics = calculateAnalytics(business.reviews);
  //         return {
  //           name: business.place_name,
  //           isYourBusiness: business.place_id === yourClientData.place_id,
  //           totalReviews: analytics.totalReviews,
  //           avgRating: analytics.avgRating,
  //           responseRate: analytics.responseRate,
  //           positivePercentage: analytics.positivePercentage,
  //           negativePercentage: analytics.negativePercentage,
  //           highestRatingCount: analytics.highestRatingCount,
  //           lowestRatingCount: analytics.lowestRatingCount,
  //         };
  //       }),
  //       latestReviews: latestReviews.map(review => ({
  //         author: review.author || 'Anonymous',
  //         rating: review.rating,
  //         date: review.date,
  //         reviewText: review.review_text || 'No review text',
  //         responded: review.response_by_owner === 'yes',
  //       })),
  //       competitorsSummary: competitors.map(comp => {
  //         const analytics = calculateAnalytics(comp.reviews);
  //         return {
  //           name: comp.place_name,
  //           totalReviews: analytics.totalReviews,
  //           avgRating: analytics.avgRating,
  //           responseRate: analytics.responseRate,
  //         };
  //       }),
  //       aiInsights: aiRecommendations ? {
  //         summary: aiRecommendations.summary,
  //         strengths: aiRecommendations.strengths,
  //         weaknesses: aiRecommendations.weaknesses,
  //         recommendations: aiRecommendations.recommendations,
  //         actionPlan: aiRecommendations.actionPlan,
  //       } : null,
  //     };

  //     // Generate HTML content
  //     const htmlContent = generateVisualHTMLReport(pdfData);
  //     pdfContainer.innerHTML = htmlContent;

  //     // Wait for content to render
  //     await new Promise(resolve => setTimeout(resolve, 500));

  //     // ============================================
  //     // METHOD 1: Using html2canvas + jsPDF (Client-side)
  //     // Install: npm install html2canvas jspdf
  //     // ============================================

  //     // Uncomment this when you install the libraries:

  //     const html2canvas = (await import('html2canvas')).default;
  //     const jsPDF = (await import('jspdf')).default;

  //     const content = pdfContainer.querySelector('.container') as HTMLElement;
  //     const canvas = await html2canvas(content, {
  //       scale: 2,
  //       useCORS: true,
  //       logging: false,
  //       backgroundColor: '#ffffff'
  //     });

  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF({
  //       orientation: 'portrait',
  //       unit: 'mm',
  //       format: 'a4'
  //     });

  //     const imgWidth = 210; // A4 width in mm
  //     const pageHeight = 297; // A4 height in mm
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight;

  //     while (heightLeft >= 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;
  //     }

  //     pdf.save(`competitor-analysis-${selectedBusiness.place_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);


  //     // ============================================
  //     // METHOD 2: Using your Backend API (Recommended for production)
  //     // ============================================

  //     // Send HTML to your backend API
  //     const response = await fetch('http://localhost:3000/api/v1/generate-pdf', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         // 'Authorization': 'Bearer YOUR_TOKEN'
  //       },
  //       body: JSON.stringify({
  //         html: htmlContent,
  //         data: pdfData,
  //         filename: `competitor-analysis-${selectedBusiness.place_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
  //       })
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to generate PDF');
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `competitor-analysis-${selectedBusiness.place_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);

  //     // Clean up
  //     document.body.removeChild(pdfContainer);

  //     alert('✅ PDF report downloaded successfully!');

  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     alert('⚠️ PDF generation is not configured yet.\n\nTo enable PDF downloads:\n\n1. Install libraries: npm install html2canvas jspdf\n2. Uncomment METHOD 1 in the code (line ~850)\n\nOR\n\n1. Set up your backend PDF API\n2. Update YOUR_PDF_API_ENDPOINT (line ~890)\n\nFor now, showing preview...');

  //     // Fallback: Show preview in new window
  //     const previewWindow = window.open('', '_blank');
  //     if (previewWindow) {
  //       const pdfData = {
  //         reportDate: new Date().toLocaleDateString('en-US', {
  //           year: 'numeric',
  //           month: 'long',
  //           day: 'numeric'
  //         }),
  //         selectedBusiness: {
  //           name: selectedBusiness.place_name,
  //           isYourBusiness: selectedBusiness.place_id === yourClientData.place_id,
  //         },
  //         timeRange: timeRange,
  //         metrics: {
  //           totalReviews: selectedAnalytics.totalReviews,
  //           averageRating: selectedAnalytics.avgRating,
  //           responseRate: selectedAnalytics.responseRate,
  //           positivePercentage: selectedAnalytics.positivePercentage,
  //           negativePercentage: selectedAnalytics.negativePercentage,
  //         },
  //         chartData: {
  //           monthlyData: [
  //             { month: 'May', value: 1 },
  //             { month: 'Jun', value: 1 },
  //             { month: 'Jul', value: 1 },
  //             { month: 'Aug', value: 1 },
  //             { month: 'Sep', value: 5 },
  //             { month: 'Oct', value: 3 }
  //           ],
  //         },
  //         ratingDistribution: selectedAnalytics.ratingDistribution,
  //         comparisonData: allBusinesses.map(business => {
  //           const analytics = calculateAnalytics(business.reviews);
  //           return {
  //             name: business.place_name,
  //             isYourBusiness: business.place_id === yourClientData.place_id,
  //             totalReviews: analytics.totalReviews,
  //             avgRating: analytics.avgRating,
  //             responseRate: analytics.responseRate,
  //             positivePercentage: analytics.positivePercentage,
  //             negativePercentage: analytics.negativePercentage,
  //             highestRatingCount: analytics.highestRatingCount,
  //             lowestRatingCount: analytics.lowestRatingCount,
  //           };
  //         }),
  //         latestReviews: latestReviews.map(review => ({
  //           author: review.author || 'Anonymous',
  //           rating: review.rating,
  //           date: review.date,
  //           reviewText: review.review_text || 'No review text',
  //           responded: review.response_by_owner === 'yes',
  //         })),
  //         aiInsights: aiRecommendations ? {
  //           summary: aiRecommendations.summary,
  //           strengths: aiRecommendations.strengths,
  //           weaknesses: aiRecommendations.weaknesses,
  //           recommendations: aiRecommendations.recommendations,
  //           actionPlan: aiRecommendations.actionPlan,
  //         } : null,
  //       };

  //       previewWindow.document.write(generateVisualHTMLReport(pdfData));
  //       previewWindow.document.close();
  //     }
  //   } finally {
  //     setIsDownloadingPDF(false);
  //   }
  // };
  // =============================================
  // GENERATE HTML REPORT IN NEW WINDOW
  // =============================================

  const openHTMLReport = () => {
    setIsDownloadingPDF(true);

    try {
      // Prepare comprehensive data
      const reportData = {
        reportDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timestamp: Date.now(),
        selectedBusiness: {
          name: selectedBusiness.place_name,
          isYourBusiness: selectedBusiness.place_id === yourClientData.place_id,
        },
        timeRange: timeRange,
        metrics: {
          totalReviews: selectedAnalytics.totalReviews,
          averageRating: selectedAnalytics.avgRating,
          responseRate: selectedAnalytics.responseRate,
          positivePercentage: selectedAnalytics.positivePercentage,
          negativePercentage: selectedAnalytics.negativePercentage,
        },
        chartData: {
          monthlyData: [
            { month: 'May', value: 1 },
            { month: 'Jun', value: 1 },
            { month: 'Jul', value: 1 },
            { month: 'Aug', value: 1 },
            { month: 'Sep', value: 5 },
            { month: 'Oct', value: 3 }
          ],
        },
        ratingDistribution: selectedAnalytics.ratingDistribution,
        comparisonData: allBusinesses.map(business => {
          const analytics = calculateAnalytics(business.reviews);
          return {
            name: business.place_name,
            isYourBusiness: business.place_id === yourClientData.place_id,
            totalReviews: analytics.totalReviews,
            avgRating: analytics.avgRating,
            responseRate: analytics.responseRate,
            positivePercentage: analytics.positivePercentage,
            negativePercentage: analytics.negativePercentage,
            highestRatingCount: analytics.highestRatingCount,
            lowestRatingCount: analytics.lowestRatingCount,
          };
        }),
        latestReviews: latestReviews.map(review => ({
          author: review.author || 'Anonymous',
          rating: review.rating,
          date: review.date,
          reviewText: review.review_text || 'No review text',
          responded: review.response_by_owner === 'yes',
        })),
        competitorsSummary: competitors.map(comp => {
          const analytics = calculateAnalytics(comp.reviews);
          return {
            name: comp.place_name,
            totalReviews: analytics.totalReviews,
            avgRating: analytics.avgRating,
            responseRate: analytics.responseRate,
          };
        }),
        aiInsights: aiRecommendations ? {
          summary: aiRecommendations.summary,
          strengths: aiRecommendations.strengths,
          weaknesses: aiRecommendations.weaknesses,
          recommendations: aiRecommendations.recommendations,
          actionPlan: aiRecommendations.actionPlan,
        } : null,
      };

      // Generate HTML content
      const htmlContent = generateVisualHTMLReport(reportData);

      // Open in new window
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
      } else {
        alert('⚠️ Please allow pop-ups to view the report');
      }

    } catch (error) {
      console.error('Error generating report:', error);
      alert('⚠️ Error generating report. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };



  // =============================================
  // Generate Visual HTML Report with Charts
  // =============================================

  const generateVisualHTMLReport = (data: any) => {
    // Generate SVG chart for single business
    const generateSingleLineChart = () => {
      const monthlyData = data.chartData.monthlyData;
      const maxValue = Math.max(...monthlyData.map((d: any) => d.value));
      const points = monthlyData.map((d: any, i: number) => {
        const x = 100 + (i * 120);
        const y = 230 - (d.value / maxValue * 200);
        return `${x},${y}`;
      }).join(' ');

      return `
        <svg width="100%" height="300" viewBox="0 0 800 300" style="border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
          <text x="400" y="25" text-anchor="middle" font-size="16" font-weight="600" fill="#1f2937">
            ${data.selectedBusiness.name} - Review Trends
          </text>
          ${[0, 2, 4, 6, 8, 10].map(val => `
            <line x1="60" y1="${260 - (val * 20)}" x2="780" y2="${260 - (val * 20)}" 
                  stroke="#e5e7eb" stroke-dasharray="3,3"/>
            <text x="40" y="${265 - (val * 20)}" fill="#6b7280" font-size="12" text-anchor="end">${val}</text>
          `).join('')}
          
          ${monthlyData.map((d: any, i: number) => `
            <text x="${100 + (i * 120)}" y="290" fill="#6b7280" font-size="12" text-anchor="middle">${d.month}</text>
          `).join('')}
          
          <polyline points="${points}" fill="none" stroke="#3b82f6" stroke-width="3"/>
          
          ${monthlyData.map((d: any, i: number) => {
        const x = 100 + (i * 120);
        const y = 260 - (d.value / maxValue * 200);
        return `<circle cx="${x}" cy="${y}" r="6" fill="#3b82f6"/>`;
      }).join('')}
        </svg>
      `;
    };

    // Generate comparison chart with all businesses
    const generateComparisonChart = () => {
      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      const maxValue = 10;

      // Your Business data
      const yourData = [1, 1, 1, 1, 3, 3];
      const yourPoints = yourData.map((val, i) => {
        const x = 100 + (i * 120);
        const y = 260 - (val / maxValue * 200);
        return `${x},${y}`;
      }).join(' ');

      // Competitor data
      const compData = [1, 1, 1, 1, 4, 3];
      const compPoints = compData.map((val, i) => {
        const x = 100 + (i * 120);
        const y = 260 - (val / maxValue * 200);
        return `${x},${y}`;
      }).join(' ');

      // All Competitors data
      const allCompData = [1, 1, 1, 1, 5, 3];
      const allCompPoints = allCompData.map((val, i) => {
        const x = 100 + (i * 120);
        const y = 260 - (val / maxValue * 200);
        return `${x},${y}`;
      }).join(' ');

      return `
        <svg width="100%" height="350" viewBox="0 0 800 350" style="border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
          <text x="400" y="25" text-anchor="middle" font-size="16" font-weight="600" fill="#1f2937">
            Competitive Comparison - All Businesses
          </text>
          
          ${[0, 2, 4, 6, 8, 10].map(val => `
            <line x1="60" y1="${260 - (val * 20)}" x2="780" y2="${260 - (val * 20)}" 
                  stroke="#e5e7eb" stroke-dasharray="3,3"/>
            <text x="40" y="${265 - (val * 20)}" fill="#6b7280" font-size="12" text-anchor="end">${val}</text>
          `).join('')}
          
          ${months.map((month, i) => `
            <text x="${100 + (i * 120)}" y="290" fill="#6b7280" font-size="12" text-anchor="middle">${month}</text>
          `).join('')}
          
          <!-- Your Business Line (Blue) -->
          <polyline points="${yourPoints}" fill="none" stroke="#3b82f6" stroke-width="3"/>
          ${yourData.map((val, i) => {
        const x = 100 + (i * 120);
        const y = 260 - (val / maxValue * 200);
        return `<circle cx="${x}" cy="${y}" r="6" fill="#3b82f6"/>`;
      }).join('')}
          
          <!-- Selected Competitor Line (Green) -->
          <polyline points="${compPoints}" fill="none" stroke="#10b981" stroke-width="3"/>
          ${compData.map((val, i) => {
        const x = 100 + (i * 120);
        const y = 260 - (val / maxValue * 200);
        return `<circle cx="${x}" cy="${y}" r="6" fill="#10b981"/>`;
      }).join('')}
          
          <!-- All Competitors Line (Orange) -->
          <polyline points="${allCompPoints}" fill="none" stroke="#f97316" stroke-width="3"/>
          ${allCompData.map((val, i) => {
        const x = 100 + (i * 120);
        const y = 260 - (val / maxValue * 200);
        return `<circle cx="${x}" cy="${y}" r="6" fill="#f97316"/>`;
      }).join('')}
          
          <!-- Legend -->
          <g transform="translate(250, 310)">
            <circle cx="0" cy="0" r="5" fill="#3b82f6"/>
            <text x="12" y="5" font-size="12" fill="#4b5563">${data.comparisonData[0]?.name || 'Your Business'}</text>
            
            <circle cx="150" cy="0" r="5" fill="#10b981"/>
            <text x="162" y="5" font-size="12" fill="#4b5563">${data.selectedBusiness.name}</text>
            
            <circle cx="300" cy="0" r="5" fill="#f97316"/>
            <text x="312" y="5" font-size="12" fill="#4b5563">All Competitors</text>
          </g>
        </svg>
      `;
    };

    // Generate rating distribution bars
    const generateRatingBars = () => {
      return data.ratingDistribution.map((item: any) => `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 600;">${item.rating} ⭐</span>
            <span>${item.count} (${Math.round(item.percentage)}%)</span>
          </div>
          <div style="width: 100%; height: 24px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); width: ${item.percentage}%; border-radius: 4px;"></div>
          </div>
        </div>
      `).join('');
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Competitor Analysis Report - ${data.selectedBusiness.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
            background: #f9fafb;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 4px solid #3b82f6;
          }
          .header h1 { 
            color: #1f2937;
            font-size: 36px;
            margin-bottom: 15px;
            font-weight: 700;
          }
          .header .subtitle { 
            color: #6b7280;
            font-size: 18px;
            margin: 5px 0;
          }
          .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 40px 0;
          }
          .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 24px;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .metric-card .label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 12px;
            font-weight: 500;
          }
          .metric-card .value {
            font-size: 36px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .metric-card:nth-child(1) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .metric-card:nth-child(2) { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          .metric-card:nth-child(3) { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          .metric-card:nth-child(4) { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
          
          .section {
            margin: 50px 0;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 28px;
            color: #1f2937;
            margin-bottom: 25px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .section-title::before {
            content: '';
            width: 6px;
            height: 32px;
            background: #3b82f6;
            border-radius: 3px;
          }
          .chart-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          th, td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background: #f9fafb;
            font-weight: 700;
            color: #374151;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          tr:hover {
            background: #f9fafb;
          }
          .highlight-row {
            background: #dbeafe !important;
            font-weight: 600;
          }
          .review-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .review-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .review-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            align-items: flex-start;
          }
          .review-author {
            font-weight: 700;
            color: #1f2937;
            font-size: 16px;
          }
          .review-date {
            color: #6b7280;
            font-size: 13px;
            margin-top: 4px;
          }
          .stars {
            color: #fbbf24;
            font-size: 18px;
          }
          .review-text {
            color: #4b5563;
            line-height: 1.6;
            margin-top: 12px;
          }
          .responded-badge {
            display: inline-block;
            background: #d1fae5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 12px;
          }
          .ai-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            color: white;
            margin: 30px 0;
          }
          .ai-section h3 {
            font-size: 22px;
            margin-bottom: 20px;
            font-weight: 700;
          }
          .ai-box {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
          }
          .ai-box h4 {
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          ul {
            margin-left: 25px;
            margin-top: 12px;
          }
          li {
            margin-bottom: 10px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
          }
          @media print {
            body { background: white; padding: 20px; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>📊 Competitor Analysis Report</h1>
            <div class="subtitle">${data.selectedBusiness.name}</div>
            ${data.selectedBusiness.isYourBusiness ? '<span class="badge">Your Business</span>' : ''}
            <div class="subtitle" style="margin-top: 15px;">
              📅 Report Date: ${data.reportDate} | ⏱️ Time Range: ${data.timeRange} Months
            </div>
          </div>

          <!-- Metrics Cards -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="label">💬 Total Reviews</div>
              <div class="value">${data.metrics.totalReviews}</div>
            </div>
            <div class="metric-card">
              <div class="label">⭐ Average Rating</div>
              <div class="value">${data.metrics.averageRating}</div>
            </div>
            <div class="metric-card">
              <div class="label">↩️ Response Rate</div>
              <div class="value">${data.metrics.responseRate}%</div>
            </div>
            <div class="metric-card">
              <div class="label">👍 Positive Reviews</div>
              <div class="value">${data.metrics.positivePercentage}%</div>
            </div>
          </div>

          <!-- Review Trends Charts - Both Views -->
          <div class="section">
            <h2 class="section-title">📈 Review Trends Analysis</h2>
            
            <!-- Single View Chart -->
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 20px; color: #374151; margin-bottom: 20px; font-weight: 600;">
                Individual Performance
              </h3>
              <div class="chart-container">
                ${generateSingleLineChart()}
              </div>
            </div>

            <!-- Comparison View Chart -->
            <div>
              <h3 style="font-size: 20px; color: #374151; margin-bottom: 20px; font-weight: 600;">
                Competitive Comparison
              </h3>
              <div class="chart-container">
                ${generateComparisonChart()}
              </div>
            </div>
          </div>

          <!-- Rating Distribution -->
          <div class="section">
            <h2 class="section-title">⭐ Rating Distribution</h2>
            <div style="background: white; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
              ${generateRatingBars()}
            </div>
          </div>

          <!-- Competitive Comparison Table -->
          <div class="section">
            <h2 class="section-title">🏆 Competitive Comparison</h2>
            <table>
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Total Reviews</th>
                  <th>Avg Rating</th>
                  <th>Response Rate</th>
                  <th>Positive %</th>
                  <th>5-Star Count</th>
                </tr>
              </thead>
              <tbody>
                ${data.comparisonData.map((business: any) => `
                  <tr class="${business.isYourBusiness ? 'highlight-row' : ''}">
                    <td><strong>${business.name}</strong>${business.isYourBusiness ? ' 👑' : ''}</td>
                    <td>${business.totalReviews}</td>
                    <td>${business.avgRating} ⭐</td>
                    <td>${business.responseRate}%</td>
                    <td>${business.positivePercentage}%</td>
                    <td>${business.highestRatingCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Latest Reviews -->
          <div class="section">
            <h2 class="section-title">💬 Latest Reviews</h2>
            <div class="review-grid">
              ${data.latestReviews.map((review: any) => `
                <div class="review-card">
                  <div class="review-header">
                    <div>
                      <div class="review-author">${review.author}</div>
                      <div class="review-date">${review.date}</div>
                    </div>
                    <div class="stars">${'⭐'.repeat(review.rating)}</div>
                  </div>
                  <div class="review-text">${review.reviewText}</div>
                  ${review.responded ? '<span class="responded-badge">✓ Owner Responded</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          ${data.aiInsights ? `
          <!-- AI Recommendations -->
          <div class="section">
            <div class="ai-section">
              <h3>🤖 AI-Powered Insights & Recommendations</h3>
              
              <div class="ai-box">
                <h4>📊 Executive Summary</h4>
                <p>${data.aiInsights.summary}</p>
              </div>

              <div class="ai-box">
                <h4>💪 Top Strengths</h4>
                <ul>
                  ${data.aiInsights.strengths.map((s: string) => `<li>${s}</li>`).join('')}
                </ul>
              </div>

              <div class="ai-box">
                <h4>⚠️ Areas for Improvement</h4>
                <ul>
                  ${data.aiInsights.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}
                </ul>
              </div>

              <div class="ai-box">
                <h4>🎯 Strategic Recommendations</h4>
                <ul>
                  ${data.aiInsights.recommendations.map((r: string, i: number) => `<li><strong>${i + 1}.</strong> ${r}</li>`).join('')}
                </ul>
              </div>

              <div class="ai-box">
                <h4>📅 30-60-90 Day Action Plan</h4>
                <div style="margin-top: 15px;">
                  <strong>First 30 Days:</strong>
                  <ul>${data.aiInsights.actionPlan.days30.map((a: string) => `<li>${a}</li>`).join('')}</ul>
                </div>
                <div style="margin-top: 15px;">
                  <strong>Days 31-60:</strong>
                  <ul>${data.aiInsights.actionPlan.days60.map((a: string) => `<li>${a}</li>`).join('')}</ul>
                </div>
                <div style="margin-top: 15px;">
                  <strong>Days 61-90:</strong>
                  <ul>${data.aiInsights.actionPlan.days90.map((a: string) => `<li>${a}</li>`).join('')}</ul>
                </div>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p><strong>Competitor Analysis Dashboard</strong></p>
            <p>© ${new Date().getFullYear()} - Confidential Business Intelligence Report</p>
            <p style="margin-top: 10px; font-size: 12px;">Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // =============================================
  // HTML REPORT GENERATOR FOR PDF
  // =============================================

  const generateHTMLReport = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Competitor Analysis Report - ${data.selectedBusiness.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            color: #1f2937;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #2563eb; 
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header .subtitle { 
            color: #6b7280; 
            font-size: 16px;
          }
          .section { 
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 24px; 
            color: #1f2937;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            background: #f9fafb;
          }
          .metric-card .label {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .metric-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .highlight-row {
            background: #dbeafe !important;
            font-weight: 600;
          }
          .stars {
            color: #fbbf24;
          }
          .review-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: white;
          }
          .review-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .review-author {
            font-weight: 600;
          }
          .review-date {
            color: #6b7280;
            font-size: 12px;
          }
          .review-text {
            color: #4b5563;
            margin-top: 10px;
          }
          .ai-section {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .ai-section h3 {
            color: #1e40af;
            margin-bottom: 15px;
          }
          ul {
            margin-left: 20px;
            margin-top: 10px;
          }
          li {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Competitor Analysis Report</h1>
          <div class="subtitle">
            ${data.selectedBusiness.name} ${data.selectedBusiness.isYourBusiness ? '(Your Business)' : ''}
          </div>
          <div class="subtitle">
            Report Date: ${data.reportDate} | Time Range: ${data.timeRange} Months
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="section">
          <h2 class="section-title">📊 Executive Summary</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="label">Total Reviews</div>
              <div class="value">${data.metrics.totalReviews}</div>
            </div>
            <div class="metric-card">
              <div class="label">Average Rating</div>
              <div class="value">${data.metrics.averageRating} ⭐</div>
            </div>
            <div class="metric-card">
              <div class="label">Response Rate</div>
              <div class="value">${data.metrics.responseRate}%</div>
            </div>
            <div class="metric-card">
              <div class="label">Positive Reviews</div>
              <div class="value">${data.metrics.positivePercentage}%</div>
            </div>
          </div>
        </div>

        <!-- Rating Distribution -->
        <div class="section">
          <h2 class="section-title">⭐ Rating Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Rating</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${data.ratingDistribution.map((item: any) => `
                <tr>
                  <td>${item.rating} Stars</td>
                  <td>${item.count}</td>
                  <td>${Math.round(item.percentage)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Competitive Comparison -->
        <div class="section">
          <h2 class="section-title">🏆 Competitive Comparison - All Businesses</h2>
          <table>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Total Reviews</th>
                <th>Avg Rating</th>
                <th>Response Rate</th>
                <th>Positive %</th>
                <th>5-Star Count</th>
              </tr>
            </thead>
            <tbody>
              ${data.comparisonData.map((business: any) => `
                <tr class="${business.isYourBusiness ? 'highlight-row' : ''}">
                  <td>${business.name}${business.isYourBusiness ? ' (Your Business)' : ''}</td>
                  <td>${business.totalReviews}</td>
                  <td>${business.avgRating} ⭐</td>
                  <td>${business.responseRate}%</td>
                  <td>${business.positivePercentage}%</td>
                  <td>${business.highestRatingCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Latest Reviews -->
        <div class="section">
          <h2 class="section-title">💬 Latest Reviews</h2>
          ${data.latestReviews.map((review: any) => `
            <div class="review-card">
              <div class="review-header">
                <div>
                  <div class="review-author">${review.author}</div>
                  <div class="review-date">${review.date}</div>
                </div>
                <div class="stars">${'⭐'.repeat(review.rating)}</div>
              </div>
              <div class="review-text">${review.reviewText}</div>
              ${review.responded ? '<div style="color: #10b981; font-size: 12px; margin-top: 8px;">✓ Owner Responded</div>' : ''}
            </div>
          `).join('')}
        </div>

        ${data.aiInsights ? `
        <!-- AI Recommendations -->
        <div class="section">
          <h2 class="section-title">🤖 AI-Powered Insights & Recommendations</h2>
          
          <div class="ai-section">
            <h3>Executive Summary</h3>
            <p>${data.aiInsights.summary}</p>
          </div>

          <div class="ai-section" style="background: #f0fdf4; border-color: #10b981;">
            <h3 style="color: #065f46;">💪 Top Strengths</h3>
            <ul>
              ${data.aiInsights.strengths.map((s: string) => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <div class="ai-section" style="background: #fef2f2; border-color: #ef4444;">
            <h3 style="color: #991b1b;">⚠️ Areas for Improvement</h3>
            <ul>
              ${data.aiInsights.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}
            </ul>
          </div>

          <div class="ai-section" style="background: #faf5ff; border-color: #a855f7;">
            <h3 style="color: #6b21a8;">🎯 Strategic Recommendations</h3>
            <ul>
              ${data.aiInsights.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="ai-section" style="background: #fffbeb; border-color: #f59e0b;">
            <h3 style="color: #92400e;">📅 30-60-90 Day Action Plan</h3>
            
            <h4 style="margin-top: 15px;">First 30 Days:</h4>
            <ul>
              ${data.aiInsights.actionPlan.days30.map((a: string) => `<li>${a}</li>`).join('')}
            </ul>
            
            <h4 style="margin-top: 15px;">Days 31-60:</h4>
            <ul>
              ${data.aiInsights.actionPlan.days60.map((a: string) => `<li>${a}</li>`).join('')}
            </ul>
            
            <h4 style="margin-top: 15px;">Days 61-90:</h4>
            <ul>
              ${data.aiInsights.actionPlan.days90.map((a: string) => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>This report was generated automatically by the Competitor Analysis Dashboard</p>
          <p>© ${new Date().getFullYear()} - Confidential Business Intelligence Report</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
              COMPETITOR ANALYSIS
            </p>
            <h1 className="text-4xl font-bold text-gray-900">{selectedBusiness.place_name}</h1>
            {selectedBusiness.place_id === yourClientData.place_id && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Your Business
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedBusiness.place_id}
                onChange={(e) => setSelectedBusiness(allBusinesses.find(b => b.place_id === e.target.value)!)}
                className="appearance-none px-6 py-3 pr-10 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <option value={yourClientData.place_id}>{yourClientData.place_name} (Your Business)</option>
                <option disabled>───────────────</option>
                {competitors.map(comp => (
                  <option key={comp.place_id} value={comp.place_id}>{comp.place_name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
            </div>
            <button
              onClick={() => setShowAddCompetitorDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Competitor
            </button>
            <button
              onClick={openHTMLReport}
              disabled={isDownloadingPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingPDF ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  View Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Time range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Month</option>
            <option value={6}>6 Month</option>
            <option value={12}>12 Month</option>
          </select>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">Total Reviews</span>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{selectedAnalytics.totalReviews}</div>
            <p className="text-xs text-gray-500">No previous data</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">Average Rating</span>
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{selectedAnalytics.avgRating}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(parseFloat(selectedAnalytics.avgRating)) ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">Response Rate</span>
              <Reply className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{selectedAnalytics.responseRate}%</div>
            <p className="text-xs text-gray-500">{selectedAnalytics.totalReviews} total responses</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">Review Velocity</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">2.0</div>
            <p className="text-xs text-gray-500">Avg reviews per month</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review trends</h3>
                <p className="text-sm text-gray-500">Past {timeRange} months</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartMode('single')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${chartMode === 'single' ? 'bg-blue-600 text-white' : 'bg-white text-black'
                    }`}
                >
                  {selectedBusiness.place_name}
                </button>
                <button
                  onClick={() => setChartMode('comparison')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${chartMode === 'comparison' ? 'bg-blue-600 text-white' : 'bg-white text-black'
                    }`}
                >
                  Comparison
                </button>
              </div>
            </div>
            <div className="h-64 relative">
              {chartMode === 'single' ? (
                <svg className="w-full h-full" viewBox="0 0 800 250">
                  {[0, 2, 4, 6, 8, 10].map((val, i) => (
                    <g key={i}>
                      <line x1="60" y1={230 - (val * 23)} x2="780" y2={230 - (val * 23)} stroke="#e5e7eb" strokeDasharray="3,3" />
                      <text x="40" y={235 - (val * 23)} fill="#6b7280" fontSize="12" textAnchor="end">{val}</text>
                    </g>
                  ))}
                  {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, i) => (
                    <text key={month} x={100 + (i * 120)} y="245" fill="#6b7280" fontSize="12" textAnchor="middle">{month}</text>
                  ))}
                  <polyline points="100,207 220,207 340,207 460,207 580,115 700,161" fill="none" stroke="#3b82f6" strokeWidth="3" />
                  {[1, 1, 1, 1, 5, 3].map((value, i) => {
                    const x = 100 + (i * 120);
                    const y = 230 - (value * 23);
                    const month = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i];
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="15" fill="transparent" style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredDataPoint({ month, value, x, y, label: selectedCompetitor.place_name })}
                          onMouseLeave={() => setHoveredDataPoint(null)} />
                        <circle cx={x} cy={y} r="5" fill="#3b82f6" style={{ pointerEvents: 'none' }} />
                        {hoveredDataPoint?.month === month && hoveredDataPoint?.label === selectedCompetitor.place_name && (
                          <circle cx={x} cy={y} r="8" fill="#3b82f6" opacity="0.5" />
                        )}
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 800 250">
                  {[0, 2, 4, 6, 8, 10].map((val, i) => (
                    <g key={i}>
                      <line x1="60" y1={230 - (val * 23)} x2="780" y2={230 - (val * 23)} stroke="#e5e7eb" strokeDasharray="3,3" />
                      <text x="40" y={235 - (val * 23)} fill="#6b7280" fontSize="12" textAnchor="end">{val}</text>
                    </g>
                  ))}
                  {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, i) => (
                    <text key={month} x={100 + (i * 120)} y="245" fill="#6b7280" fontSize="12" textAnchor="middle">{month}</text>
                  ))}
                  <polyline points="100,207 220,207 340,207 460,207 580,161 700,161" fill="none" stroke="#3b82f6" strokeWidth="3" />
                  {[1, 1, 1, 1, 3, 3].map((value, i) => {
                    const x = 100 + (i * 120);
                    const y = 230 - (value * 23);
                    const month = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i];
                    return (
                      <g key={`your-${i}`}>
                        <circle cx={x} cy={y} r="15" fill="transparent" style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredDataPoint({ month, value, x, y, label: yourClientData.place_name })}
                          onMouseLeave={() => setHoveredDataPoint(null)} />
                        <circle cx={x} cy={y} r="5" fill="#3b82f6" style={{ pointerEvents: 'none' }} />
                        {hoveredDataPoint?.month === month && hoveredDataPoint?.label === yourClientData.place_name && (
                          <circle cx={x} cy={y} r="8" fill="#3b82f6" opacity="0.5" />
                        )}
                      </g>
                    );
                  })}
                  <polyline points="100,207 220,207 340,207 460,207 580,138 700,161" fill="none" stroke="#10b981" strokeWidth="3" />
                  {[1, 1, 1, 1, 4, 3].map((value, i) => {
                    const x = 100 + (i * 120);
                    const y = 230 - (value * 23);
                    const month = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i];
                    return (
                      <g key={`comp-${i}`}>
                        <circle cx={x} cy={y} r="15" fill="transparent" style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredDataPoint({ month, value, x, y, label: selectedCompetitor.place_name })}
                          onMouseLeave={() => setHoveredDataPoint(null)} />
                        <circle cx={x} cy={y} r="5" fill="#10b981" style={{ pointerEvents: 'none' }} />
                        {hoveredDataPoint?.month === month && hoveredDataPoint?.label === selectedCompetitor.place_name && (
                          <circle cx={x} cy={y} r="8" fill="#10b981" opacity="0.5" />
                        )}
                      </g>
                    );
                  })}
                  <polyline points="100,207 220,207 340,207 460,207 580,115 700,161" fill="none" stroke="#f97316" strokeWidth="3" />
                  {[1, 1, 1, 1, 5, 3].map((value, i) => {
                    const x = 100 + (i * 120);
                    const y = 230 - (value * 23);
                    const month = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i];
                    return (
                      <g key={`all-${i}`}>
                        <circle cx={x} cy={y} r="15" fill="transparent" style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredDataPoint({ month, value, x, y, label: 'All Competitors' })}
                          onMouseLeave={() => setHoveredDataPoint(null)} />
                        <circle cx={x} cy={y} r="5" fill="#f97316" style={{ pointerEvents: 'none' }} />
                        {hoveredDataPoint?.month === month && hoveredDataPoint?.label === 'All Competitors' && (
                          <circle cx={x} cy={y} r="8" fill="#f97316" opacity="0.5" />
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
              {hoveredDataPoint && (
                <div
                  className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
                  style={{
                    left: `${(hoveredDataPoint.x / 800) * 100}%`,
                    top: `${(hoveredDataPoint.y / 250) * 100}%`,
                    transform: 'translate(-50%, -120%)'
                  }}
                >
                  <div className="font-semibold">{hoveredDataPoint.label}</div>
                  <div className="text-gray-300">{hoveredDataPoint.month}</div>
                  <div className="font-bold text-lg">{hoveredDataPoint.value} reviews</div>
                </div>
              )}
            </div>
            {chartMode === 'comparison' && (
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{yourClientData.place_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{selectedBusiness.place_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">All Competitors</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating distribution</h3>
            <div className="space-y-4">
              {selectedAnalytics.ratingDistribution.map((item) => (
                <div key={item.rating}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700">{item.rating} star</span>
                      <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.count} ({Math.round(item.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Dashboard - All Businesses */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Comparison dashboard - All Businesses</h2>
            <p className="text-sm text-gray-500 mt-1">Compare your business against all competitors</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">Metric</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 uppercase bg-blue-50">{yourClientData.place_name}</th>
                  {competitors.map((comp) => (
                    <th key={comp.place_id} className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase">
                      {comp.place_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Total Reviews */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">Total Reviews</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">{yourAnalytics.totalReviews}</td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.totalReviews}</span>
                          {getComparisonIcon(yourAnalytics.totalReviews, analytics.totalReviews)}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Average Rating */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">Average Rating</td>
                  <td className="px-6 py-4 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700">{yourAnalytics.avgRating}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(parseFloat(yourAnalytics.avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.avgRating}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(parseFloat(analytics.avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {getComparisonIcon(parseFloat(yourAnalytics.avgRating), parseFloat(analytics.avgRating))}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Response Rate */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">Response Rate</td>
                  <td className="px-6 py-4 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700">{yourAnalytics.responseRate}%</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${yourAnalytics.responseRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.responseRate}%</span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-500 rounded-full"
                              style={{ width: `${analytics.responseRate}%` }}
                            />
                          </div>
                          {getComparisonIcon(yourAnalytics.responseRate, analytics.responseRate)}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Positive Reviews */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">Positive Reviews (4-5★)</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">{yourAnalytics.positivePercentage}%</td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.positivePercentage}%</span>
                          {getComparisonIcon(yourAnalytics.positivePercentage, analytics.positivePercentage)}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Negative Reviews */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">Negative Reviews (1-2★)</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">{yourAnalytics.negativePercentage}%</td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.negativePercentage}%</span>
                          {getComparisonIcon(yourAnalytics.negativePercentage, analytics.negativePercentage, true)}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Highest Rating Count (5 Stars) */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">5-Star Reviews</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">{yourAnalytics.highestRatingCount}</td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.highestRatingCount}</span>
                          {getComparisonIcon(yourAnalytics.highestRatingCount, analytics.highestRatingCount)}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Lowest Rating Count (1-2 Stars) */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">1-2 Star Reviews</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">{yourAnalytics.lowestRatingCount}</td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{analytics.lowestRatingCount}</span>
                          {getComparisonIcon(yourAnalytics.lowestRatingCount, analytics.lowestRatingCount, true)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span>Your Business</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span>Better than competitor</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-red-600" />
                <span>Worse than competitor</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-400" />
                <span>Same as competitor</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Button */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                AI-Powered Insights & Recommendations
              </h2>
              <p className="text-white/90">Get personalized recommendations based on your competitive analysis</p>
            </div>
            <button
              onClick={generateAIRecommendations}
              disabled={isLoadingAI}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingAI ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Insights
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        {showAIPanel && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
            {isLoadingAI ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Analyzing your data...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            ) : aiRecommendations ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    AI-Generated Insights
                  </h2>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Executive Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Executive Summary</h3>
                  <p className="text-blue-800 leading-relaxed">{aiRecommendations.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">💪 Top Strengths</h3>
                    <ul className="space-y-3">
                      {aiRecommendations.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-green-800">
                          <span className="text-green-600 font-bold">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Areas for Improvement</h3>
                    <ul className="space-y-3">
                      {aiRecommendations.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-red-800">
                          <span className="text-red-600 font-bold">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">🎯 Strategic Recommendations</h3>
                  <ul className="space-y-3">
                    {aiRecommendations.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-purple-800">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Plan */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">📅 30-60-90 Day Action Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-3">First 30 Days</h4>
                      <ul className="space-y-2">
                        {aiRecommendations.actionPlan.days30.map((action, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                            <span>✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-3">Days 31-60</h4>
                      <ul className="space-y-2">
                        {aiRecommendations.actionPlan.days60.map((action, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                            <span>✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-3">Days 61-90</h4>
                      <ul className="space-y-2">
                        {aiRecommendations.actionPlan.days90.map((action, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                            <span>✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Latest Reviews */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Latest reviews - {selectedBusiness.place_name}
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Read more
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {latestReviews.map((review, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{review.author || "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
                  {review.review_text || "No review text provided"}
                </p>
                {review.response_by_owner === 'yes' && (
                  <p className="text-xs font-medium text-green-600">Owner responded</p>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${selectedBusiness.place_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              View All on Google Business
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* All Competitors Summary */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Competitors Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {competitors.map((comp) => {
              const analytics = calculateAnalytics(comp.reviews);
              return (
                <div
                  key={comp.place_id}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${selectedBusiness.place_id === comp.place_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                  onClick={() => setSelectedBusiness(comp)}
                >
                  <h3 className="font-semibold text-gray-900 mb-3">{comp.place_name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Reviews:</span>
                      <span className="font-semibold text-gray-900">{analytics.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Rating:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">{analytics.avgRating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response Rate:</span>
                      <span className="font-semibold text-gray-900">{analytics.responseRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${analytics.responseRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Competitor Dialog */}
      {showAddCompetitorDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Competitor</h3>
              <button
                onClick={() => {
                  setShowAddCompetitorDialog(false);
                  setNewPlaceId('');
                  setAddCompetitorError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter the Google Business Place ID to fetch competitor data and add it to your analysis.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place ID <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={newPlaceId}
                onChange={(e) => {
                  setNewPlaceId(e.target.value);
                  setAddCompetitorError('');
                }}
                placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isAddingCompetitor}
              />

              {addCompetitorError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{addCompetitorError}</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 How to find Place ID:</h4>
                <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                  <li>Go to Google Maps</li>
                  <li>Search for the business</li>
                  <li>Click on the business</li>
                  <li>Copy the Place ID from the URL</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowAddCompetitorDialog(false);
                  setNewPlaceId('');
                  setAddCompetitorError('');
                }}
                disabled={isAddingCompetitor}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={isAddingCompetitor || !newPlaceId.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingCompetitor ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Competitor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompetitorDashboard;