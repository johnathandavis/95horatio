SELECT
   sourceusername,
   COUNT(*) AS messages,
   AVG("sentimentpositive") AS positivity,
   AVG("sentimentnegative") AS negativity,
   AVG("sentimentneutral") AS neutrality,
   AVG("sentimentmixed") AS mixed
FROM "%database%"."%tablename%"
GROUP BY sourceusername
ORDER BY positivity DESC;