import { AnalyticsOptions, ConfigOptions } from "@cloudinary-util/url-loader";

import { NEXT_CLOUDINARY_ANALYTICS_PRODUCT_ID, NEXT_CLOUDINARY_ANALYTICS_ID, NEXT_CLOUDINARY_VERSION, NEXT_VERSION } from '../constants/analytics';

/**
 * pollForProcessingImage
 */

export interface PollForProcessingImageOptions {
  src: string;
}

/**
 * Poll for an image that hasn't finished processing.
 * Will call itself recurisvely until an image is found, or it fails to fetch.
 */
export interface PollForProcessingImageResponse {
  status: number;
  success: boolean;
  error?: string;
}

export async function pollForProcessingImage(options: PollForProcessingImageOptions): Promise<PollForProcessingImageResponse> {
  const { src } = options;
  try {
    const response = await fetch(src);

    if (!response.ok) {
      if (response.status === 423) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return await pollForProcessingImage(options);
      }
      return {
        success: false,
        status: response.status,
        error: response.statusText || "Failed to fetch the image",
      };
    }

    return {
      success: true,
      status: response.status,
    };

  } catch (error) {
    return {
      success: false,
      status: 500,
      error: (error as Error).message || "Network error",
    };
  }
}

/**
 * getCloudinaryConfig
 */

export function getCloudinaryConfig(config?: ConfigOptions): ConfigOptions {
  const cloudName = config?.cloud?.cloudName ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error('A Cloudinary Cloud name is required, please make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set and configured in your environment.');
  }

  const apiKey = config?.cloud?.apiKey ?? process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const secureDistribution = config?.url?.secureDistribution ?? process.env.NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION;
  const privateCdn = config?.url?.privateCdn ?? process.env.NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN;

  return Object.assign({
    cloud: {
      ...config?.cloud,
      apiKey,
      cloudName
    },
    url: {
      ...config?.url,
      secureDistribution,
      privateCdn
    }
  }, config);
}

/**
 * getCloudinaryAnalytics
 */

export function getCloudinaryAnalytics(analytics?: AnalyticsOptions) {
  return Object.assign({
    product: NEXT_CLOUDINARY_ANALYTICS_PRODUCT_ID,
    sdkCode: NEXT_CLOUDINARY_ANALYTICS_ID,
    sdkSemver: NEXT_CLOUDINARY_VERSION,
    techVersion: NEXT_VERSION,
    feature: ''
  }, analytics)
}