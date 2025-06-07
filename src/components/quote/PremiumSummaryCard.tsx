
import type { QuoteDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';

interface PremiumSummaryCardProps {
  summary: QuoteDetails['premiumSummary'];
}

export function PremiumSummaryCard({ summary }: PremiumSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFXUlEQVR4nO2bTWhdRRTHf+lLGmP6YRrRiKBU6wcFET8SFdxKbbARxYUbNyJuRExjVUTRVLrQLmxDtSIpIrrQpBsJbtUaBVMpiKIVbWr8oGmTJtHEhU2UVA6cC5fLzNx758597ynvDwPh5d4zZ86bOed/zpwHDTTQQAPloAL0AE8Cw8A48BOwAKwA52NjWT+X/3+qzw/o+yLnP4MWoA84DPyRWKTvEDmjKlfk1yU6gd3AbKBF24bIHwQ2USe4ENgD/FnywpNjCXgJaKvl4u8BpnIofQZ4D3gC2AZcC3QAa3V06Gfyv37gfX3HJVN8Rm+1F94KHMi46Hl9VpyZD5qA24DXVJZpjlVgSI1YOi4DjmVY+ClgJ9AecO52jQzTljm/BLooEZuBEykL/1u/jfUl+51BDZ2mIyHHKDi2AKdTFv8jcBPVw82WL+S06ht0259MWfwHwAaqD5lzzKDPyVDHoTXDmR+uMVtrBg5ZfILoXwgHMixePHWt0WQxgvijQnH+fMq2ryee3mw4Dqu+PKFNPapt8SdqdObTINHnh4SuP/uE4z2Oxa8E9PYXKAMMGTZv0XAc11nylMzYpFzbZoBXAiq7S2V+Rli8mtB5SQ2dCbtTGF5RdrdRU9tngCMqd1rJzUPAVRTHegNveTHLiy0pKa3QW19cDrxtKIaYxgRwF8XwVELmbJZ6wr0OpeYLfPviM2YyLDw5nsMf67TKFJe3I+2lww5lhBP4bvlTHouPxn3442BC1ojr4UpKGavbU4kXLPK+Bz7Uv38FfnPkGGs85749IWvBxV16HIs/U4DxfWWQt6TRJh4FLgHmLGH3Bs+5mww+7VbbwwMOA0glxxeLFiJlCoOPAO8Az+rWvz5AIXQkMbdUm4wYdhhAyli+OGuR+WCJPCCOnYl537Q9OO4wwN0FFJhwyI22/LES84rexJzCPYyYcih6dQEFHs/o7c/qLtwWuP5/TWIeyXGMmHMoJ3X/IiWsb3OGvlnlAPJuUVxsMLQRyw6FilZcr/QwQhQqryg4d2tC5rlaGCDK/MQhHc9phO8KVnYyG2CupCNgwo3A84bcvYwcJPMRmHIoELTKakhYfgE+d8x/tBpOcLykMJhElyYqcQNEPOBRy/xC0UsPg8MlEKHHNAX+SDn9X4ktnTSA4GvD/HL5WjoRGnAYQC4qffCuRd4XFgOssRzFb/DHaFYq3FNCMtTnkPmycv7IAFLV3Wt5NldNzzcZqgC/OxSWW9q8qKRcrJyLFVtsV2/zBW557siTDpu2S3zIFbUPrnMkRGnjH+B+/PFG3qPcV1JJbKsHExTP/wDFCqO5S2ItKUVRcZS+ENkPAx+nsE7xN/u1iFoETyfkzmRNsgYdyk3HYnhRWrw1FnqF7t6pPQghsMHQXiOluSAXI3sJBxMPCIH9CZ0X81yMoB1YNgOsaHNCvRqg23A1lulSpBaXo5fqXZ5EihC4yNDMMenbTter18s2I4wpeakXNMfK7NFYLZrHDKWEqkN11CDxlkG/fUUFr9VWkzQj1HInNFsWfzRU72BXhiapMb0CqzY2GrZ9dO7Fv1S1TW7SlWiUgG7LFxO8TS7CZs3pszRKltk+016LRsn4cUjzCRGd3RWINUZYp7zBds0+EXrbu6qsQykhMhqSjLyut7Q+0aJJU9qDhsQmHur2VatZOskTXGQpOWb1olJKVNuV/HTG2uU79bPtmnSNZvgBxmTgemVutOl5dOUOZYxFpbc1/cFEHB2qUNk/mZnRrC5XYlNNtGjRYSSlvJZnLGglZ0c9/2jKhIrygn4tRR/RuD1vCGHL+rn8/xN9vl/fr6d23AYaaID/F/4FTZFS7W43nbIAAAAASUVORK5CYII=" alt="us-dollar" width="50" height="50" className="mr-2" />
          Premium Recommendation
        </CardTitle>
        <CardDescription>Details from Contact2.0 policy system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          {summary.status === 'Pass' ? (
            <span className="font-semibold text-green-600 ml-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Pass
            </span>
          ) : (
            <span className="font-semibold text-yellow-600 dark:text-yellow-500 ml-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Missing Information from Contact2.0
            </span>
          )}
        </div>
        
        <div className="pt-1">
          <p className="text-sm text-muted-foreground mb-0.5">Recommended Premium:</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.recommendedPremium)}</p>
        </div>

        <Button variant="link" asChild className="p-0 h-auto text-sm !mt-3">
          <a href={summary.contactSystemLink} target="_blank" rel="noopener noreferrer">
            View in Contact2.0
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
