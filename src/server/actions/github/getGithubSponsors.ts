type SponsorEntity = {
  login: string;
  name: string;
};

type Tier = {
  monthlyPriceInDollars: number;
};

type SponsorshipNode = {
  sponsorEntity: SponsorEntity;
  tier: Tier;
  createdAt: string;
};

type SponsorshipsAsMaintainer = {
  nodes: SponsorshipNode[];
};

type User = {
  sponsorshipsAsMaintainer: SponsorshipsAsMaintainer;
};

type Data = {
  user: User;
};

type GraphQLResponse = {
  data: Data;
  errors?: any;
};

async function getGithubSponsors(
  username: string,
  token: string
): Promise<GraphQLResponse> {
  const query = `
    query {
      user(login: "${username}") {
        sponsorshipsAsMaintainer(first: 100) {
          nodes {
            sponsorEntity {
              ... on User {
                login
                name
              }
              ... on Organization {
                login
                name
              }
            }
            tier {
              monthlyPriceInDollars
            }
            createdAt
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

  return response.json();
}
