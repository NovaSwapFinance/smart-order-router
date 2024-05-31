import { Pool } from '@novaswap/v3-sdk';
import { Pair } from '@novaswap/v2-sdk';
import { RouteWithValidQuote } from '../routers/alpha-router';
import { MixedRoute, V2Route, V3Route } from '../routers/router';
export declare const routeToString: (route: V3Route | V2Route | MixedRoute) => string;
export declare const routeAmountsToString: (routeAmounts: RouteWithValidQuote[]) => string;
export declare const routeAmountToString: (routeAmount: RouteWithValidQuote) => string;
export declare const poolToString: (p: Pool | Pair) => string;
