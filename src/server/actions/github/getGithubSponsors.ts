"use server";

type Sponsor = {
  login: string;
  name: string;
};

type Sponsors = {
  nodes: Sponsor[];
};

type User = {
  sponsors: Sponsors;
};

type Data = {
  user: User;
};

type GraphQLResponse = {
  data: Data;
  errors?: any;
};

export async function getGithubSponsors(
  username: string,
): Promise<GraphQLResponse> {
  
  const token = process.env.GH_API_KEY;
  
  const query = `
    query {
      user(login: "${username}") {
        sponsors(first: 100, orderBy: {field: RELEVANCE, direction: DESC}) {
          nodes {
            ... on User { login, name }
            ... on Organization { login, name }
          }
        }
      }
    }
  `;
  
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
    
    const res = await response.json();

    return res;
}
