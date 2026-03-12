import {
    Layout,
    LegacyCard,
    SkeletonBodyText,
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
            </Layout.Section>

        </Layout >
        // </SkeletonPage >
    )
}

export default Skeleton