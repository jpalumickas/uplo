// TODO: Make serviceName to get from uploader service
const prismaAdapter = ({ prisma }) => {
  const createBlob = async ({ params }) => {
    const blob = await prisma.activeStorageBlob.create({
      data: {
        key: params.key,
        filename: params.fileName,
        contentType: params.contentType,
        byteSize: params.byteSize,
        metadata: JSON.stringify(params.metadata || {}),
        checksum: params.checksum,
        serviceName: 'google',
      },
    });

    return blob;
  };

  return {
    prisma,
    createBlob,
  };
};

export default prismaAdapter;
