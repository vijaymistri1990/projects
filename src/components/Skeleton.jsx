import React from 'react'
import {
    SkeletonPage,
    Layout,
    LegacyCard,
    SkeletonBodyText,
    TextContainer, SkeletonDisplayText
} from '@shopify/polaris';
const Skeleton = () => {
    return (
        // <SkeletonPage >
        <Layout>
            <Layout.Section>
                <LegacyCard sectioned>
                    <SkeletonBodyText />
                </LegacyCard>
                <LegacyCard sectioned>
                    <SkeletonBodyText />
                </LegacyCard>
                {/* <LegacyCard sectioned>
                    <SkeletonBodyText />
                </LegacyCard> */}
            </Layout.Section>

        </Layout >
        // </SkeletonPage >
    )
}

export default Skeleton