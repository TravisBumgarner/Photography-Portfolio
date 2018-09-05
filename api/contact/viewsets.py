
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet, GenericViewSet
from rest_framework import permissions
from rest_framework.views import APIView

from .serializers import *
from .models import *
from .forms import *


class ContactViewSet(GenericViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    pagination_class = None

    def get_throttles(self):
        if self.action in ['create',]:
            self.throttle_scope = 'contact.' + self.action
        return super(ContactViewSet, self).get_throttles()

    def create(self, request):
        r = request.data
        form = ContactForm(r)

        if not (len(r['name']) and len(r['email']) and len(r['message'])):
            is_submit_error = True
            detail = "Sorry, there was an error with your message, please check your inputs and try again."

        else:
            c = Contact(
                name=r['name'],
                email=r['email'],
                website=r['website'],
                message=r['message'],
            )
            c.save()

            send("Name: {}\nEmail: {}\nWebsite: {}\nMessage: {}".format(r['name'], r['email'], r['website'], r['message']))

            is_submit_error = False
            detail = "Thank you for your message, I'll get back to you shortly!"

        return Response({
            'is_submit_error': is_submit_error,
            'detail': detail
        })   